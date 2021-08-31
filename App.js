"use strict";

import React,{Fragment} from 'react';
import {Share as RNShare,Text,View,PermissionsAndroid,Platform,FlatList,Image,Alert,TouchableOpacity,Dimensions,Linking} from 'react-native';
import Share from 'react-native-share';
import AdButler from './src/AdsApiAdButler';
import {styles,theme} from './src/styles';
import MaskedView from '@react-native-masked-view/masked-view';
import {Portal} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DeviceInfo from 'react-native-device-info';
import firestore,{firebase} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeepARModuleWrapper from './src/components/DeepARModuleWrapper';
import BeltNav from './src/components/BeltNav';
import SideMenu from 'react-native-side-menu-updated';
import SideMenuNav from './src/components/SideMenuNav';
import FilterSchema from './src/FilterSchema';
import AnimatedFav from './src/components/AnimatedFav';
import RNFS from 'react-native-fs';
import Filters from './src/components/Filters';
import DebugButton from './src/components/DebugButton';
import {differenceInHours} from 'date-fns/esm';
import FavoriteItems from './src/components/FavoriteItems';
import shimAllSettled from 'promise.allsettled/shim';
import CameraFlash from './src/components/CameraFlash';
import Modal from 'react-native-modal';
import U from './src/Utilities';
import IconNav from './src/components/IconNav';
import {createIconSet} from 'react-native-vector-icons';
import CameraRoll from '@react-native-community/cameraroll';
import Snackbar from 'react-native-snackbar';
import NetInfo from '@react-native-community/netinfo';
import AdItemTitleText from './src/components/AdItemTitleText';

export default class App extends React.Component {

  constructor(props) {
    super(props);
    console.debug('\n\n__________SESSION START__________________________');

    this.state = {
      permissionsGranted: Platform.OS === 'ios',
      switchCameraInProgress: false,
      multiSelectedItemObjects: [],
      sidemenuVisible: false,
      userLoggedIn: false,
      sideMenuData: null,
      forceRenderFlatList: true,
      animatedFavIcons: [],
      adItemsAreLoading: true,
      photoPreviewModalVisible: false,
      photoReadyToBeSaved: false,
      currentWornAdItem: null, //stateful because it triggers title updates
    }

    this.currentCenterAdItem = null; //represents currently shown mask in scroll, could also be worn

    this.renderCount = 0;

    this.userId = null; //from unique device id
    this.authUnsub = null; // function for unsubscribing from auth changes
    this.screenHeight = Dimensions.get('window').height;
    this.screenWidth = Dimensions.get('window').width;
    this.masterItemList = [];
    this.filteredItemList = [];
    this.itemTrackingURLs; //{} keyed on adId

    this.multiSelectFilterSchema = [];
    this.firstTimeFaceTimer = null;
    this.viewabilityConfig = {
      minimumViewTime: 1000,
      //viewAreaCoveragePercentThreshold: 80,
      itemVisiblePercentThreshold: 40,
      waitForInteraction: false,
    };
    this.adsAlreadyViewed = [];
    this.maskScrollRef = React.createRef();
    this.cameraFlashRef = React.createRef();
    this.maskSizeScale = .64; //used to scale masking png
    this.maskSize = this.screenWidth / 1.3;
    this.localAdItemsDir = RNFS.DocumentDirectoryPath + '/aditems/';
    this.butler;
    this.sideMenuWidth = this.screenWidth / 2.2;
    // init session with these, fetch from asyncstorage
    this.firstTimeActions = {
      buyMaskButtonExplanation: false,
      favoritesSnackbar: false,
      havingTroubleDarkSnackbar: false,
    };
    this.photoPreviewPath = null;
    this.bustCache = !true;
  }

  didAppear() {
    console.debug('didappear');
    if (this.deepARView) {
      this.deepARView.resume();
    }
  }

  willDisappear() {
    console.debug('willdisappear');
    if (this.deepARView) {
      this.deepARView.pause();
    }
  }

  onEventSent = (event) => {
    if (event.type === 'cameraSwitch') {
      this.setState({switchCameraInProgress: false})
    } else if (event.type === 'initialized') {
      // initialized sometimes dispatched twice (frame dimension changes, etc)
      this.deepARView.switchEffect('mask-10','effect');
      this.switchToFirstTexture();
    } else if (event.type === 'didStartVideoRecording') {

    } else if (event.type === 'didFinishVideoRecording') {

    } else if (event.type === 'recordingFailedWithError') {

    } else if (event.type === 'screenshotTaken') {
      this.screenshotTaken(event.value)
    } else if (event.type === 'didSwitchEffect') {

    } else if (event.type === 'imageVisibilityChanged') {
      console.log('deepar imagevisibilitychanged')
    } else if (event.type === 'faceVisibilityChanged') {
      let faceIsDetected = event.value === "true";
      console.log('deepar faceVisible?: ' + faceIsDetected)
      if (faceIsDetected && this.firstTimeFaceTimer) {
        clearTimeout(this.firstTimeFaceTimer);
        this.firstTimeFaceTimer = null;
      }
    }
  }

  takePhoto = () => {
    if (this.deepARView) {
      this.cameraFlashRef.current.flash();
      this.deepARView.takeScreenshot();
    }
  }

  screenshotTaken = (screenshotPath) => {
    if (screenshotPath != null && (typeof screenshotPath) == 'string') {
      this.photoPreviewPath = 'file://' + screenshotPath;
      console.debug(`screenshot at ${this.photoPreviewPath}`);
      this.state.photoReadyToBeSaved = true;
      this.showPhotoPreview();
    }
  }

  switchCamera = () => {
    const {switchCameraInProgress} = this.state;
    if (!switchCameraInProgress && this.deepARView) {
      this.state.switchCameraInProgress = true;
      this.deepARView.switchCamera();
    }
  }

  showSnackbar = (text = '') => {
    Snackbar.show({text: text,duration: Snackbar.LENGTH_LONG});
  }

  permissionsNotGranted = () => {
    Alert.alert(
      "Permissions were not granted",
      "Mask Fashions requires your permission to use the camera.  Please close the app and start again to allow.",
      [],{cancelable: false}
    );
  }

  showSideMenu = () => this.setState({sidemenuVisible: true});
  hideDrawer = () => this.setState({sidemenuVisible: false});
  showPhotoPreview = () => this.setState({photoPreviewModalVisible: true});

  componentDidMount() {
    console.debug('componentdidmount');

    if (Platform.OS === 'android') {
      PermissionsAndroid.requestMultiple(
        [
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          // PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        ],
      ).then(result => {
        if (
          result['android.permission.CAMERA'].match(/^granted|never_ask_again$/) &&
          // result['android.permission.RECORD_AUDIO'].match(/^granted|never_ask_again$/) &&
          result['android.permission.WRITE_EXTERNAL_STORAGE'].match(/^granted|never_ask_again$/)
        ) {
          console.debug('permissions granted android')
          // will let DeepAR module load, which dispatches an 'initialized' event
          this.setState({permissionsGranted: true});
        } else {
          this.permissionsNotGranted();
          this.setState({permissionsGranted: false});
        }
      })
    } else if (Platform.OS === 'ios') {

    }


    const checkConnection = async () => {
      NetInfo.fetch().then(state => {
        console.log('onetime connection state: ' + state.isConnected,state.isInternetReachable)
        let connected = (state.isConnected == true && state.isInternetReachable == true);
        if (connected) {
          this.init();
        } else {
          Alert.alert(
            "No internet connection",
            "",
            [{text: 'Retry',onPress: () => checkConnection()}],
            {cancelable: false}
          );
        }
      })
    }

    //checkConnection();
    this.init();

  }

  init = () => {
    this.setupUserLocal().then(uid => {
      this.showFirstTimeFaceHelp();
      if (uid != null) {
        console.debug(`got user: ${uid}`);
        this.userId = uid;
      } else {
        // TODO ??
        console.warn('uid null from setupuserlocal');
      }
    },reason => console.warn('failed: ' + reason));

    this.butler = new AdButler();
    const _getAdsAndSchema = async () => {
      return this.butler.getAdItemsWithSchema().then(allAds => {
        for (let ad of allAds) {
          this.masterItemList.push({
            adId: String(ad.id),
            url: ad.creative_url,
            name: ad.name,
            metadata: ad.metadata,
            advertiser: ad.advertiserName,
            location: ad.location,
          });
        }
        //randomize
        this.masterItemList = this.masterItemList.map((value) => ({value,sort: Math.random()})).sort((a,b) => a.sort - b.sort).map(({value}) => value);
        this.preloadAdItemImages();
        this.filteredItemList = this.masterItemList;
        console.debug('<<<<<<<<<<<<< got ads and filter schema');
        this.setState({adItemsAreLoading: false});
        let schema = new FilterSchema(this.butler.getFilterSchema());
        this.multiSelectFilterSchema = schema.filterAndReturnFilteredSchema(this.masterItemList);
        this.preloadMaskPNG();
      })
    }

    _getAdsAndSchema()
      .catch(e => {
        console.error('error fetching ads, trying again',e);
        //go again
        _getAdsAndSchema();
      })

    this.butler.getAdTrackingURLS().then(urls => this.itemTrackingURLs = urls);
    this.setupAuthListener();
  }

  // CDN urls should be parsed and pre-loaded for the listview, and also made available 
  // to Java and objc on local filesystem for the deepar native switchTexture method
  // CDN url as backup if file doesnt exist localy (then download it local?)
  // if it's been more than X hours, wipe the /aditems directory and re-download?
  preloadAdItemImages = async () => {
    await RNFS.mkdir(this.localAdItemsDir);

    const _downloadOne = (fromUrl,toFile) => {
      return RNFS.downloadFile({
        fromUrl,toFile,
        begin: (status) => {console.log('starting RNFS download ',status.jobId)},
      })
    };

    this.masterItemList.forEach(item => {
      const localDest = this.localAdItemsDir + item.adId + ".jpg";
      const CDNurl = item.url + (this.bustCache ? '?' + Math.random() : '');
      RNFS.exists(localDest)
        .then(doesExist => {
          if (!doesExist) {
            _downloadOne(CDNurl,localDest)
              .promise.then((res) => {
                console.log(`finished RNFS download, ${item.adId} (job ${res.jobId}) with ${res.statusCode}`);
                if (res.statusCode !== 200) {
                  // go again
                  console.log('RNFS download trying again ' + item.adId)
                  _downloadOne(CDNurl,localDest);
                }
              },rejected => {
                console.warn(rejected,'RNFS download trying again for ' + item.adId);
                _downloadOne(CDNurl,localDest);
              })
              .catch(e => console.error(e));
          } else {
            //console.log(`image for ${item.adId} already exists locally`);
          }
        })
    });

    this.masterItemList.forEach(v => {
      let uri = v.url;
      //console.debug(`preloading texture ${uri}`);
      Image.prefetch(uri)
        .then(
          successBool => {},
          failReason => {
            // connectivity issues cause this to fail
            console.warn(failReason);
          })
        .catch(e => console.error(e))
    });
  }
  checkFavorites = async () => {
    // must be authed to read/write firestore, must have valid userId also
    if (this.userId == null) {
      console.debug(`checkfavs user id fail ${this.userId}`);
      return;
    }

    if (this.state.userLoggedIn === false) {
      await this.loginAnon();
    }

    console.debug(`checking favs for ${this.userId}`);
    firestore().collection('users').doc(this.userId).get()
      .then(doc => {
        console.debug(`favs for ${this.userId}?`);
        if (doc.exists) {
          const favsArr = doc.data().favorites;
          console.debug('got user favs',favsArr);
          if (favsArr.length > 0 && this.firstTimeActionNotComplete('favoritesSnackbar')) {
            this.showSnackbar(
              'Click on a mask to try it on again!  Hold the red heart to remove from your favorites');
            //<Text>Click on a mask to try it on again!  Hold the <Icon name='heart-remove' size={24} color={theme.colors.bad} /> to remove from your favorites.</Text>);
            this.setFirstTimeActionComplete('favoritesSnackbar');
          }
          let el = <FavoriteItems favs={favsArr} adItems={this.masterItemList} sideMenuWidth={this.sideMenuWidth} app={this} />;
          this.setState({sideMenuData: el});
        } else {
          console.info('doc no existo for ',this.userId)
          let el = <FavoriteItems favs={[]} adItems={this.masterItemList} sideMenuWidth={this.sideMenuWidth} app={this} />;
          this.setState({sideMenuData: el});
        }
      })
      .catch(e => console.warn(`doc get failed for ${this.userId}`,e));

  }

  showAppInfo = () => {
    const el = <>
      <Text style={{fontWeight: 'bold'}}>Mask health disclaimer{`\n\n`}</Text>
      <Text style={{fontWeight: 'bold'}}>CDC info{`\n\n`}</Text>
      <Text style={{fontWeight: 'bold'}}>Privacy Policy{`\n\n`}</Text>
    </>;
    this.setState({sideMenuData: el});
  }

  showFirstTimeFaceHelp = () => {
    if (this.firstTimeActionNotComplete('havingTroubleDarkSnackbar')) {
      this.firstTimeFaceTimer = setTimeout(() => {
        this.showSnackbar('Having trouble?  It may be too dark.');
        //this.showSnackbar(<Text>Having trouble?  It may be too dark. <Icon name='lightbulb-on' size={18} color={theme.colors.text} /></Text>);
        this.setFirstTimeActionComplete('havingTroubleDarkSnackbar');
      },8000);
    }
  }

  buyButtonClicked = () => {
    if (this.firstTimeActionNotComplete('buyMaskButtonExplanation')) {
      Alert.alert(
        "Here's the deal:",
        "A one-time explanation of how the buy button will act.",
        [
          {
            text: 'Ok',style: 'default',onPress: () => {
              this.openBuyUrl();
              this.setFirstTimeActionComplete('buyMaskButtonExplanation');
            }
          },
          {text: 'Cancel',style: 'cancel',onPress: () => {}},
        ],
        {
          cancelable: true,
          onDismiss: () => {
            console.debug('DISMISSED alert')
          }
        },
      );
    } else {
      this.openBuyUrl();
    }
  }

  openBuyUrl = () => {
    let adId = this.state.currentWornAdItem.adId;
    let clickUrl = this.itemTrackingURLs[adId].clickUrl;
    let pageUrl = this.state.currentWornAdItem.location;
    console.log('logging click');
    this.hitURLNoReturn(clickUrl);
    Linking.openURL(pageUrl);
  }

  addToFavorites = async (mouseEvent) => {
    // must be authed to write to firestore, must have valid userId also
    if (this.userId == null) {
      console.debug(`addtofavs user id fail ${this.userId}`);
      return;
    }

    this.triggerAnimatedFav(mouseEvent.nativeEvent.pageX,mouseEvent.nativeEvent.pageY);
    if (this.state.userLoggedIn === false) {
      await this.loginAnon();
    }

    const adItemId = this.state.currentWornAdItem.adId;
    console.debug(`setting favorite adId (${adItemId}) for ${this.userId}`)

    // creates if doesnt exist
    let userDoc = firestore().collection('users').doc(this.userId);
    userDoc.get()
      .then(doc => {
        // update; will also create favorites field if it doesnt exist
        if (doc.exists) {
          userDoc.update({
            favorites: firestore.FieldValue.arrayUnion(adItemId),
          })
            .then(() => console.log('firestore update successful'))
            .catch(e => console.error(e));
          // create
        } else {
          userDoc.set({
            favorites: [adItemId],
          })
            .then(() => console.log('firestore set successful'))
            .catch(e => console.error('firestore set error',e));
        }
      })
      .catch(e => console.error('firestore get() error',e));
  }

  removeFromFavorites = (item) => {
    const adItemId = item.adId;
    console.debug(`removing fav adId (${adItemId}) for ${this.userId}`)
    let userDoc = firestore().collection('users').doc(this.userId);
    userDoc.get()
      .then(doc => {
        if (doc.exists) {
          userDoc.update({favorites: firestore.FieldValue.arrayRemove(adItemId)})
            .then(() => console.log('firestore delete fav successful'))
            .catch(e => console.error(e));
        }
      })
      .catch(e => console.error('firestore update() fav error',e));
  }

  setupUserLocal = async () => {
    let asyncKeys = await AsyncStorage.getAllKeys();
    let userId = await AsyncStorage.getItem('userId');
    console.log('userId from asyncstorage ',userId,`authed? ${this.state.userLoggedIn}`);
    if (userId == null) {
      try {
        userId = DeviceInfo.getUniqueId();
        console.log('got userId from deviceinfo ',userId);
        await AsyncStorage.setItem('userId',userId);
      } catch (e) {
        console.warn(e);
        try {
          userId = DeviceInfo.getUniqueId();
          await AsyncStorage.setItem('userId',userId);
        } catch (e) {
          console.warn('second setItem failed',e);
        }
      }
    }
    this.userId = userId;
    console.log(`userId from ${Platform.OS} device`,userId);

    let lastLogin = await AsyncStorage.getItem('userLastLogin');
    let isFirstLogin = !asyncKeys.includes('userLastLogin');
    console.debug('last login from local:',lastLogin,`is first? ${isFirstLogin}`);

    if (!isFirstLogin) {
      let lastLoginDate = new Date(JSON.parse(lastLogin));
      let hoursSinceLast = differenceInHours(Date.now(),lastLoginDate);
      console.log(`last login: ${lastLoginDate}, been ${hoursSinceLast}h`);
    }

    // record current login for all users
    let now = JSON.stringify(Date.parse(new Date()));
    try {
      await AsyncStorage.setItem('userLastLogin',now);
    } catch (e) {
      console.warn(e);
      try {
        await AsyncStorage.setItem('userLastLogin',now);
      } catch (e) {
        console.warn('double failed setItem',e);
      }
    }

    if (!asyncKeys.includes('firstTimeActions')) {
      await AsyncStorage.setItem('firstTimeActions',JSON.stringify(this.firstTimeActions));
      console.debug('wrote firsttimeactions to async');
    } else { //fetch to store in session
      this.firstTimeActions = JSON.parse(await AsyncStorage.getItem('firstTimeActions'));
      console.debug('current first time actions:',this.firstTimeActions);
    }

    return userId;
  }

  setFirstTimeActionComplete = async (actionKey) => {
    console.debug('setting ' + actionKey,this.firstTimeActions);
    if (this.firstTimeActions[actionKey] == true) {
      return;
    } else {
      this.firstTimeActions[actionKey] = true;
    }
    console.debug('setting ' + actionKey);
    await AsyncStorage.setItem('firstTimeActions',JSON.stringify(this.firstTimeActions));
  }

  firstTimeActionNotComplete = (actionKey) => {
    console.debug('checking ' + this.firstTimeActions[actionKey],this.firstTimeActions);
    return (actionKey in this.firstTimeActions && this.firstTimeActions[actionKey] == false);
  }

  setupAuthListener = () => {
    // returns unsub function
    this.authUnsub = firebase.auth().onAuthStateChanged(authUser => {
      if (this.state.userLoggedIn === true && !authUser) {
        console.debug(`auth state change, logged out`);
        this.setState({userLoggedIn: false});
      } else if (this.state.userLoggedIn === false && authUser) {
        console.debug(`auth state change, logged in:`,authUser);
        this.setState({userLoggedIn: true});
      }
    });
  }

  loginAnon = async () => {
    await firebase.auth().signInAnonymously()
      .then(() => {console.debug('user signed in anon')})
      .catch(e => {
        console.error('unable to auth anon, trying again',e);
        firebase.auth().signInAnonymously()
          .then(() => console.debug('unable to auth anon, second time'))
      });
  }

  preloadMaskPNG = () => {
    Image.prefetch(Image.resolveAssetSource(require('./assets/images/maskmask.png')).uri).then(response => {
      console.log('prefetched mask.png? ',response);
      // crucial
      this.setState({forceRenderFlatList: !this.state.forceRenderFlatList});
    })
  }

  switchToFirstTexture = () => {
    // this should not be hit, since DeepAR (and anything else) is not added to DOM until ads are loaded
    if (this.filteredItemList.length == 0) return;
    this.switchTexture(this.filteredItemList[0]);
  }

  switchTexture = (adItem) => {
    if (adItem == this.state.currentWornAdItem) return;
    const {url,adId} = adItem;
    const localDest = this.localAdItemsDir + adId + '.jpg';
    let URLorFilepath;
    RNFS.exists(localDest)
      .then(doesExist => {
        console.log('switch texture exists?');
        if (doesExist) {
          URLorFilepath = localDest;
        } else {
          console.warn(`ad item ${adId} does NOT exist locally, using CDN`);
          URLorFilepath = url;
        }
        this.deepARView.switchTexture(URLorFilepath,!doesExist);
        // trigger mask name title update
        this.setState({currentWornAdItem: adItem});
        this.currentCenterAdItem = adItem;
      });
  }

  switchToRandomAdItem = () => {
    console.log('random');
    if (this.filteredItemList.length < 2) return;
    
    let i;
    do {
      i = Math.floor(Math.random() * this.filteredItemList.length);
    }
    while (this.filteredItemList[i] == this.currentCenterAdItem);
    this.maskScrollRef.current.scrollToIndex({
      index: i,
      viewOffset: (this.screenWidth - this.maskSize) / 2,
    })
    console.log(this.currentCenterAdItem.adId,this.filteredItemList[i].adId);
    this.currentCenterAdItem = this.filteredItemList[i];
  }

  shareApp = () => {
    Share.open({
      message: 'it\'s Mask Fashions!',
      title: 'Mask Fashions?',
      url: 'https://maskfashions.app',
    });
  }

  hitURLNoReturn = (url) => {
    console.debug('hiturlnoreturn: ' + url);
    fetch(url).then(res => {if (res.status !== 200) fetch(url)})
      .catch(err => {
        console.error(err);
      });
  }

  onViewableItemsChanged = ({changed,viewableItems}) => {
    for (let v of viewableItems) {
      let adId = v.item.adId;
      let name = v.item.name;
      if (!this.adsAlreadyViewed.includes(adId) && this.itemTrackingURLs[adId]) {
        let url = this.itemTrackingURLs[adId].impUrl;
        console.log(`logging impression for ${name} (${adId}) at ${v.index}`);
        this.hitURLNoReturn(url);
        this.adsAlreadyViewed.push(adId);
      }
    }
  }

  applyFilters = (selectedItemObjects) => {
    let filters = selectedItemObjects;
    //console.log('filters: ',JSON.stringify(filters,null,1));
    if (filters.length == 0) {
      this.resetFlatList();
      return;
    }

    let tempMasterList = [...this.masterItemList];
    let filtered = tempMasterList.filter((item,i,arr) => {
      let itemMetadata = JSON.stringify(item.metadata);
      // run all filters on each item's metadata, any fail gets kicked
      for (let filter of filters) {
        let allMatch = true;
        if (filter.type == 'toggle') {
          //console.log('toggle',filter.name);
          allMatch = (itemMetadata.indexOf(filter.name) !== -1);
        } else if (filter.type == 'category') {
          console.log('category',filter.children);
          // test individual, throw out non matching
          for (let ch of filter.children) {
            let match = (itemMetadata.indexOf(ch.name) !== -1);
            if (!match) {
              return false;
            }
          }
        } else {
          // these are the additional, flatter entries with id and name, one per loop
          allMatch = (itemMetadata.indexOf(filter.name) !== -1);
        }
        if (allMatch == false) return; //just toss out now since they all must pass
      }
      //made it
      return true;
    });

    this.filteredItemList = filtered;
    this.refreshFlatList();
  }

  refreshFlatList = () => {
    this.maskScrollRef.current.scrollToOffset({offset: 0,animated: false,});
    this.setState({forceRenderFlatList: !this.state.forceRenderFlatList});
    this.currentCenterAdItem = this.filteredItemList[0];
  }

  resetFlatList = () => {
    this.filteredItemList = this.masterItemList;
    this.maskScrollRef.current.scrollToOffset({offset: 0,animated: true,});
    this.setState({forceRenderFlatList: !this.state.forceRenderFlatList});
    this.currentCenterAdItem = this.filteredItemList[0];
  }

  getFlatListEmptyComponent = () => {
    return (
      <View style={{justifyContent: 'center',alignItems: 'center',alignContent: 'center',width: this.screenWidth / 2}}>
        <Icon name='emoticon-confused' size={30} color={theme.colors.text} />
        <Text style={{fontSize: 15,}}>No results. Try removing some filters.</Text>
      </View>
    )
  }

  triggerAnimatedFav = (pageX,pageY) => {
    // add another to the array, add a key, render later with map()
    const count = this.state.animatedFavIcons.length;
    // need to get point relative to AnimatedFav
    const destX = -(pageX) + 9;
    const destY = -(pageY) + (Platform.OS === 'ios' ? styles.container.paddingTop : 5);
    const icon = <Fragment key={count}>
      <AnimatedFav destX={destX} destY={destY} myKey={count} style={{position: 'absolute',left: pageX,top: pageY,zIndex: 9999}} />
    </Fragment>
    const arrCopy = [...this.state.animatedFavIcons,icon];
    this.setState({animatedFavIcons: arrCopy})
  }



  reportBugEmail = () => {
    const email = 'mailto:hello@maskfashions.app'
    console.debug('device info start ****************************')
    shimAllSettled();
    Promise.allSettled([
      this.userId,
      DeviceInfo.getUniqueId(),
      `authed${this.state.userLoggedIn}`,
      Platform.OS,
      Platform.Version,
      DeviceInfo.getBrand(),
      DeviceInfo.getBaseOs(),
      DeviceInfo.getApiLevel(),
      DeviceInfo.getCodename(),
      DeviceInfo.getDeviceId(),
      DeviceInfo.getLastUpdateTime(),
      DeviceInfo.getReadableVersion(),
      DeviceInfo.getBuildNumber(),
      DeviceInfo.getBuildId(),
    ])
      .then(results => {
        console.debug('device info end   ****************************')
        let debugData = '';
        results.forEach(res => {
          if (res.status == 'fulfilled') {
            debugData += `${res.value},`;
          }
        })
        Linking.openURL(`${email}?subject=Mask Fashions bug report&body=\n\n\n*Please include the following in your message* \n${debugData}`);
      });
  }

  suggestFeatureEmail = () => {
    const email = 'mailto:hello@maskfashions.app'
    Linking.openURL(`${email}?subject=Mask Fashions feature suggestion&body=\n\n\n(Thank you for helping to make it better!)`);
  }

  renderItem = ({item,index,sep}) => {
    // TODO check androidrenderingmode software
    return (
      <TouchableOpacity style={styles.maskScrollItem(this.maskSize)}
        onPressIn={() => {this.switchTexture(item)}} delayPressIn={90} activeOpacity={.5} >
        <MaskedView key={Number(item.adId)}
          maskElement={
            <View style={{flex: 1,justifyContent: 'center',alignItems: 'center'}}>
              <Image key={Date.now()} style={{width: this.maskSize * this.maskSizeScale,height: this.maskSize * this.maskSizeScale}}
                width={this.maskSize * this.maskSizeScale} height={this.maskSize * this.maskSizeScale}
                source={require('./assets/images/maskmask.png')} defaultSource={require('./assets/images/maskmask.png')} ></Image>
            </View>
          }>
          <Image
            fadeDuration={100} progressiveRenderingEnabled={true}
            style={{width: this.maskSize,height: this.maskSize,top: -(this.maskSize * .14)}} key={Date.now() + item.adId}
            width={this.maskSize} height={this.maskSize} source={{uri: item.url}} />
        </MaskedView>
      </TouchableOpacity>
    )
  };

  IosIcons = createIconSet({
    'ios-share': '',
    'ios-bug': '',
    'ios-heart': '',
    'camera-reverse': '',
  },'Ionicons','Ionicons.ttf');

  iconByPlatform = (iosIconName,androidIconName) => {
    if (Platform.OS == 'android') return androidIconName;
    else return ({size,color}) => <IosIcons size={size} color={color} name={iosIconName} />
  };

  render() {
    console.info(`app render >>>>>>>>>>>>> #${this.renderCount++} ads loaded? ${!this.state.adItemsAreLoading}`);

    var onEventSent = (event) => {
      const onEventSentCallback = this.props.onEventSent;
      console.log("RECEIVED message from native",event.nativeEvent,onEventSentCallback);

      if (onEventSentCallback) {
        onEventSentCallback(event.nativeEvent);
      }
    }

    let {...props} = {...this.props}; delete props.onEventSent;

    const {permissionsGranted} = this.state;

    const Splash = () => {
      return (
        <View style={styles.splash}>
          <Text style={{color: theme.colors.primary,fontWeight: 'bold',fontSize: 30}}>mask fashions.</Text>
        </View>
      )
    }

    if (this.state.adItemsAreLoading) {
      return <Splash />;
    } else {
      return <View style={styles.container} >
        <SideMenu menu={<SideMenuNav app={this} sideMenuData={this.state.sideMenuData} />} bounceBackOnOverdraw={false} openMenuOffset={this.sideMenuWidth}
          menuPosition='left' isOpen={this.state.sidemenuVisible} overlayColor={'#00000066'}
          onChange={(isOpen) => {this.setState({sidemenuVisible: isOpen,sideMenuData: null})}}
        >

          <Portal name="animated icons">
            {this.state.animatedFavIcons.length > 0 ?
              this.state.animatedFavIcons.map(el => el)
              : <></>}
          </Portal>

          <Modal style={{marginHorizontal: 20,marginVertical: this.screenHeight / 6,}} backdropColor='#00000066' animationInTiming={400} animationOutTiming={200} coverScreen={false}
            isVisible={this.state.photoPreviewModalVisible} useNativeDriverForBackdrop={true} useNativeDriver={true}
            onBackButtonPress={() => {
              console.debug('back button');
              this.setState({photoPreviewModalVisible: false});
            }}
            onBackdropPress={() => {
              console.debug('backdrop pressed');
              this.setState({photoPreviewModalVisible: false});
            }}
            onModalHide={() => {
              console.debug('modalhide')
            }} >
            <View style={{margin: 10,backgroundColor: theme.colors.background,flex: 1,justifyContent: 'space-around',alignItems: 'center'}} >
              <Image resizeMode='contain' source={{uri: this.photoPreviewPath,width: (this.screenWidth - 20 * 2) - 40,height: (this.screenHeight / 6 * 2) - 40}} />
              <Text style={{fontSize: 17,fontStyle: 'italic'}}>
                Lookin good.
              </Text>
              <TouchableOpacity style={{width: '100%',flexDirection: 'row',justifyContent: 'space-around'}}>
                <IconNav icon='close' title='Cancel' onPress={() => {this.setState({photoPreviewModalVisible: false}); this.photoPreviewPath = null;}} />
                <IconNav icon={this.iconByPlatform('ios-share','share-variant')} title='Share' onPress={() => {
                  Share.open({
                    title: 'Share your Mask Fashion',
                    url: this.photoPreviewPath,
                    showAppsToView: true,
                  });
                }} />
                {this.state.photoReadyToBeSaved ?
                  <IconNav icon='download' title='Save' onPress={async () => {
                    CameraRoll.save(this.photoPreviewPath,{album: 'Mask Fashions'})
                      .then((res) => {
                        this.setState({photoReadyToBeSaved: false});
                        console.debug('saved photo to ' + res)
                      },(rej) => console.warn(rej))
                  }} />
                  :
                  <IconNav icon='check' title={'Saved to\n' + (Platform.OS === 'ios' ? 'Photos' : 'Gallery')} color='#6c8' />
                }
              </TouchableOpacity>
            </View>
          </Modal>

          <View style={styles.appbar}>
            <TouchableOpacity style={{position: 'absolute',left: 10}} onPressIn={this.showSideMenu} activeOpacity={.5} delayPressIn={0}>
              <Icon size={32} name='menu' color={theme.colors.text} />
            </TouchableOpacity>
            <View>
              <Text style={{fontSize: 15,fontWeight: 'bold',lineHeight: 15}} >Mask Fashions</Text>
              <Text style={{fontSize: 11,lineHeight: 11}}>Stay safe. Look good.</Text>
            </View>
          </View>


          {permissionsGranted ?
            <View name="DeepAR container" style={styles.deeparContainer}>
              <DeepARModuleWrapper onEventSent={this.onEventSent} ref={ref => this.deepARView = ref} />
              <CameraFlash style={{position: 'absolute',width: '100%',height: '100%'}} ref={this.cameraFlashRef} />
              <AdItemTitleText currentAdItem={this.state.currentWornAdItem} />
              <TouchableOpacity delayPressIn={20} onPressIn={this.switchCamera}
                style={{position: 'absolute',opacity: .4,top: 8,right: 8}}>
                {<this.IosIcons name='camera-reverse' size={44} color='#fff' />}
              </TouchableOpacity>
            </View>
            :
            <Text>permissions not granted</Text>}

          <BeltNav app={this} />

          <View name="mask scroll" style={styles.maskScroll(this.maskSize)} >
            <FlatList ref={this.maskScrollRef} decelerationRate={.95} extraData={this.state.forceRenderFlatList}
              snapToOffsets={new Array(this.filteredItemList.length).fill(null).map((v,i) => (i * this.maskSize) - (this.screenWidth - this.maskSize) / 2)}
              ListEmptyComponent={
                <View style={{justifyContent: 'center',alignItems: 'center',alignContent: 'center',width: this.screenWidth / 2}}>
                  <Icon name='emoticon-confused' size={30} color={theme.colors.text} />
                  <Text style={{fontSize: 15,}}>No results. Try removing some filters.</Text>
                </View>
              }
              contentContainerStyle={{alignItems: 'center',flexGrow: 1,justifyContent: 'center'}}
              keyExtractor={(item,index) => item.adId}
              horizontal={true} data={this.filteredItemList} renderItem={this.renderItem}
              onViewableItemsChanged={this.onViewableItemsChanged}
              viewabilityConfig={this.viewabilityConfig}
            />
          </View>

          <View name="filter container" style={[styles.filtersContainer]}>
            <Filters filterSchema={this.multiSelectFilterSchema} app={this} />
          </View>
        </SideMenu>
      </View>
    }
  }

}

