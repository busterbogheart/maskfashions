"use strict";

import React,{Fragment} from 'react';
import {Share as RNShare,Text,View,PermissionsAndroid,Platform,FlatList,Image,Alert,TouchableOpacity,Dimensions,Linking,ActivityIndicator} from 'react-native';
import Share from 'react-native-share';
import AdButler from './src/AdsApiAdButler';
import {styles,theme} from './src/styles';
import MaskedView from '@react-native-masked-view/masked-view';
import {Snackbar,Portal,Appbar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DeviceInfo from 'react-native-device-info';
import firestore,{firebase} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {differenceInSeconds} from 'date-fns';
import DeepARModuleWrapper from './src/components/DeepARModuleWrapper';
import BeltNav from './src/components/BeltNav';
import SideMenu from 'react-native-side-menu-updated';
import SideMenuNav from './src/components/SideMenuNav';
import FilterSchema from './src/FilterSchema';
import AnimatedFav from './src/components/AnimatedFav';
import RNFS from 'react-native-fs';
import Filters from './src/components/Filters';
import DebugButton from './src/components/DebugButton';


export default class App extends React.Component {

  constructor(props) {
    super(props);
    console.debug('\n\n__________SESSION START__________________________');

    this.state = {
      permissionsGranted: Platform.OS === 'ios',
      switchCameraInProgress: false,
      multiSelectedItemObjects: [],
      snackbarVisible: false,
      snackbarText: null,
      sidemenuVisible: false,
      userLoggedIn: false,
      sideMenuData: null,
      forceRenderFlatList: true,
      animatedFavIcons: [],
      adItemsAreLoading: true,
    }

    this.currentAdItem = 0; //one of this.masterItemList objects 
    this.renderCount = 0;
    this.isRelease = true;

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
    this.maskSizeScale = .77;
    this.maskSize = this.screenWidth / 1.3;
    this.localAdItemsDir = RNFS.DocumentDirectoryPath + '/aditems/';
    this.butler;
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
      // initialized sometimes called twice (frame dimension changes, etc)
      this.deepARView.switchEffect('mask-09','effect');
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

  onChangeEffect = (direction) => {
    if (!this.deepARView) {
      return
    }


    return;

    const {currentTexture: currentEffectIndex} = this.state
    var newIndex = direction > 0 ? currentEffectIndex + 1 : currentEffectIndex - 1
    if (newIndex >= effectsData.length) {
      newIndex = 0
    }
    if (newIndex < 0) {
      newIndex = effectsData.length - 1
    }

    const newEffect = effectsData[newIndex]
    this.deepARView.switchEffect(newEffect.name,'effect')

    this.setState({currentEffectIndex: newIndex})

  }

  takeScreenshot = () => {
    if (this.deepARView) {
      this.deepARView.takeScreenshot()
    }
  }

  screenshotTaken = (screenshotPath) => {
    const path = 'file://' + screenshotPath;
    console.debug(`screenshot at ${path}`);
    Share.open({
      url: path,
      title: "Share your mask fashion.",
      message: 'It\'s a message\n\n',
    })
      .then(res => console.debug(res))
      .catch(err => console.info(err));
  }

  switchCamera = () => {
    const {switchCameraInProgress} = this.state;
    if (!switchCameraInProgress && this.deepARView) {
      this.setState({switchCameraInProgress: true});
      this.deepARView.switchCamera();
    }
  }

  showSnackbar = (text = '') => {
    this.setState({snackbarText: text,snackbarVisible: true});
  }

  permissionsNotGranted = () => {
    Alert.alert(
      "Permissions were not granted",
      "Mask Fashions requires your permission to ....  Please close the app and open again to allow.",
      [],{cancelable: false}
    );
  }

  showNativeDialog = () => {
    Alert.alert(
      "Here's the deal",
      "Some explanation of how the buy button will act.",
      [
        {text: 'ok'},
        {text: 'less than ok',style: 'cancel'},
        {text: 'VERY ok',style: 'destructive'},
      ],
      {cancelable: true}
    );
  }

  showSideMenu = () => this.setState({sidemenuVisible: true});
  hideDrawer = () => this.setState({sidemenuVisible: false});

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
          console.debug('permissions granted')
          this.firstTimeFaceTimer = setTimeout(() => {
            this.showSnackbar(<Text>Having trouble?  It may be too dark. <Icon name='lightbulb-on' size={18} color={theme.colors.text} /></Text>);
          },8000);
          // will let DeepAR module load, which dispatches an 'initialized' event
          this.setState({permissionsGranted: true});
        } else {
          this.permissionsNotGranted();
          this.setState({permissionsGranted: false});
        }
      })
    }

    this.butler = new AdButler();
    const _getAdsAndSchema = async () => {
      return this.butler.getAdItemsWithSchema().then(allAds => {
        for (let ad of allAds) {
          this.masterItemList.push({
            adId: String(ad.id),
            url: ad.creative_url,
            name: ad.name,
            metadata: ad.metadata,
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
    this.setupUserLocal().then(
      uid => {
        if (uid != null) {
          console.debug(`got user: ${uid}`);
          this.userId = uid;
        } else {
          // TODO ??
          console.warn('uid null from setuplocaluser');
        }
      },reason => console.warn('failed: ' + reason));
  }

  mockDelay = ms => new Promise(res => setTimeout(res,ms));

  // CDN urls should be parsed and pre-loaded for the listview, and also made available 
  // to Java and objc on local filesystem for the deepar native switchTexture method
  // CDN url as backup if file doesnt exist localy (then download it local?)
  // if it's been more than X hours, wipe the /aditems directory and re-download?
  preloadAdItemImages = async () => {
    await RNFS.mkdir(this.localAdItemsDir);

    const _downloadOne = (fromUrl,toFile) => {
      return RNFS.downloadFile({
        fromUrl,toFile,
        begin: (status) => {console.log('started RNFS job ',status.jobId)},
      })
    };

    this.masterItemList.forEach(item => {
      const localDest = this.localAdItemsDir + item.adId + ".jpg";
      const CDNurl = item.url;
      RNFS.exists(localDest)
        .then(doesExist => {
          if (!doesExist) {
            _downloadOne(CDNurl,localDest)
              .promise.then((res) => {
                console.log(`finished RNFS download, ${item.adId} (job ${res.jobId}) with ${res.statusCode}`);
                if (res.statusCode !== 200) {
                  // go again
                  _downloadOne(CDNurl,localDest);
                }
              },rejected => {
                console.warn(rejected);
                _downloadOne(CDNurl,localDest);
              })
              .catch(e => console.error(e));
          } else {
            console.log(`image for ${item.adId} already exists locally`);
          }
        })
    });

    this.masterItemList.forEach(v => {
      let uri = v.url;
      console.debug(`preloading texture ${uri}`);
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

  // authed user and device unique id required for favorites.  
  // device unique id not required for auth.
  // get them separately but ensure both exist later for r/w favorites.
  checkFavorites = () => {
    if (this.state.userLoggedIn === false || this.userId == null) {
      console.debug(`checkfavs user ${this.userId} not authed or null user, auth ${this.state.userLoggedIn}`);
      return;
    }

    console.debug(`checking favs for ${this.userId}`);
    firestore().collection('users').doc(this.userId).get()
      .then(doc => {
        console.debug(`favs for ${this.userId}?`);
        if (doc.exists) {
          console.debug('got user doc',doc.data());
          let el = <View style={{flex: 1,justifyContent: 'center',width: 100,height: 100}}>
            {this.renderItem({item: this.masterItemList[0]})}
            {this.renderItem({item: this.masterItemList[2]})}
          </View>;
          this.setState({sideMenuData: el});
        } else {
          //TODO
          // show tutorial, cta to add
          console.info('doc no existo for ',this.userId)
        }
      })
      .catch(e => console.warn(`doc get failed for ${this.userId}`,e));

  }

  showAppInfo = () => {
    this.setState({sideMenuData: <Text style={{padding: 20,fontSize: 20}}>DISCLAIMER</Text>});
  }

  addToFavorites = (mouseEvent) => {
    this.triggerAnimatedFav(mouseEvent.nativeEvent.pageX,mouseEvent.nativeEvent.pageY);

    return;
    if (this.state.userLoggedIn === false || this.userId == null) {
      console.debug(`addtofavs user ${this.userId} not authed or null user, auth ${this.state.userLoggedIn}`);
      return;
    }

    const adItemId = String(Math.floor(Math.random() * 99999));
    console.debug(`setting favorites (${adItemId}) for ${this.userId}`)

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

  setupUserLocal = async () => {
    // awaits exit the async function, giving control elsewhere until promise returns
    let userId = await AsyncStorage.getItem('userId')
    console.log('userId from local ',userId,`authed? ${this.state.userLoggedIn}`);
    if (userId == null) {
      try {
        userId = DeviceInfo.getUniqueId();
        console.log('userId from device ',userId);
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
    let isFirstLogin = Boolean(lastLogin) == false;
    console.debug('last login from local:',lastLogin,`is first? ${isFirstLogin}`);

    if (!isFirstLogin) {
      let lastLoginDate = new Date(JSON.parse(lastLogin));
      // let hoursSinceLast = differenceInHours(Date.now(), lastLoginDate);
      // console.log(`last login: ${lastLoginDate}, been ${hoursSinceLast}h`);
      console.log(`last login: ${lastLoginDate}, been ${differenceInSeconds(Date.now(),lastLoginDate)}s`);
    }

    // record current login for all users
    let now = JSON.stringify(Date.parse(new Date()));
    try {
      await AsyncStorage.setItem('userLastLogin',now);
    } catch (e) {
      console.warn(e);
      // do it again!
      try {
        await AsyncStorage.setItem('userLastLogin',now);
      } catch (e) {
        console.warn('double failed setItem',e);
      }
    }

    return userId;
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

  loginAnon = () => {
    console.log('loginanon');
    firebase.auth().signInAnonymously()
      .then(() => {console.debug('user signed in anon')})
      .catch(e => {
        console.error('unable to auth anon, trying again',e);
        firebase.auth().signInAnonymously()
          .then(() => console.debug('user signed in anon second time'))
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
    const {url,adId} = adItem;
    const localDest = this.localAdItemsDir + adId + '.jpg';
    let URLorFilepath;
    RNFS.exists(localDest)
      .then(doesExist => {
        if (doesExist) {
          URLorFilepath = localDest;
        } else {
          console.warn(`ad item ${adId} does NOT exist locally, using CDN`);
          URLorFilepath = url;
        }
        this.deepARView.switchTexture(URLorFilepath,!doesExist);
        this.currentAdItem = adItem;
      });
  }

  switchToRandomAdItem = () => {
    let i;
    do {
      i = Math.floor(Math.random() * this.filteredItemList.length);
    }
    while (this.filteredItemList[i] == this.currentAdItem);
    this.maskScrollRef.current.scrollToIndex({
      index: i,
      viewOffset: (this.screenWidth - this.maskSize) / 2,
    })
    this.currentAdItem = this.filteredItemList[i];
  }

  shareApp = () => {
    Share.open({
      message: 'it\'s Mask Fashions!',
      title: 'Mask Fashions?',
      url: 'https://maskfashions.app',
    });
  }

  trackImpression = (url) => {
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
        console.log(`logging impression for ${name} (${adId}) at ${v.index}`);
        let url = this.itemTrackingURLs[adId].impUrl;
        this.trackImpression(url);
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
  }

  resetFlatList = () => {
    this.filteredItemList = this.masterItemList;
    this.maskScrollRef.current.scrollToOffset({offset: 0,animated: true,});
    this.setState({forceRenderFlatList: !this.state.forceRenderFlatList});
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
    const destX = -(pageX) + 15;
    const destY = -(pageY) + (Platform.OS === 'ios' ? styles.container.paddingTop : 5);
    const icon = <Fragment key={count}>
      <AnimatedFav destX={destX} destY={destY} myKey={count} style={{position: 'absolute',left: pageX,top: pageY,zIndex: 9999}} />
    </Fragment>
    const arrCopy = [...this.state.animatedFavIcons,icon];
    this.setState({animatedFavIcons: arrCopy})
  }

  renderItem = ({item,index,sep}) => {
    // TODO check androidrenderingmode software
    return (
      <TouchableOpacity style={styles.maskScrollItem(this.maskSize)}
        onPressIn={() => {this.switchTexture(item)}} delayPressIn={80} activeOpacity={.5} >
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
            style={{width: this.maskSize,height: this.maskSize,top: -(this.maskSize * .18)}} key={Date.now() + item.adId}
            width={this.maskSize} height={this.maskSize} source={{uri: item.url}} />
        </MaskedView>
      </TouchableOpacity>
    )
  };

  render() {
    console.info(`app render >>>>>>>>>>>>> #${this.renderCount++}`);

    var onEventSent = (event) => {
      const onEventSentCallback = this.props.onEventSent;
      console.log("RECEIVED message from native",event.nativeEvent,onEventSentCallback);

      if (onEventSentCallback) {
        onEventSentCallback(event.nativeEvent);
      }
    }

    let {...props} = {...this.props}; delete props.onEventSent;

    const {permissionsGranted} = this.state;

    const Splash = () => {return (
      <View style={styles.splash}>
        <Text style={{color: theme.colors.primary,fontWeight: 'bold',fontSize: 30}}>mask fashions.</Text>
      </View>
      )}

    if (this.state.adItemsAreLoading) {
      return <Splash />;
    } else {
      console.debug('<<<<<<< ads loaded app render');
      return <View style={styles.container} >
            <SideMenu menu={<SideMenuNav app={this} content={this.state.sideMenuData} />} bounceBackOnOverdraw={false} openMenuOffset={this.screenWidth / 2.2}
              menuPosition='left' isOpen={this.state.sidemenuVisible} overlayColor={'#00000066'}
              onChange={(isOpen) => {this.setState({sidemenuVisible: isOpen,sideMenuData: null})}}
            >
              <Portal name="animated icons">
                {this.state.animatedFavIcons.length > 0 ?
                  this.state.animatedFavIcons.map(el => el)
                  : <></>}
              </Portal>

              <Portal>
                <Snackbar
                  visible={this.state.snackbarVisible} duration={5000}
                  onDismiss={() => {console.debug('dismiss?'); this.setState({snackbarVisible: false});}}
                  action={{label: 'Ok',onPress: () => this.setState({snackbarVisible: false})}}
                >
                  {this.state.snackbarText ? this.state.snackbarText : <><Text>this is only a test ({Platform.Version}) </Text><Icon name='check-circle-outline' /></>}
                </Snackbar>
              </Portal>

              <Appbar.Header style={styles.appbar}>
                <Appbar.Action size={32} icon='menu' onPress={this.showSideMenu} />
                <Appbar.Content titleStyle={{fontSize: 15,fontWeight: 'bold'}} subtitleStyle={{fontSize: 11,}} title='Mask Fashions' subtitle='Stay safe. Look good.' />
              </Appbar.Header>

              <View name="DeepAR container" style={styles.deeparContainer}>
                {permissionsGranted ?
                  <DeepARModuleWrapper onEventSent={this.onEventSent} ref={ref => this.deepARView = ref} />
                  :
                  <Text>permissions not granted</Text>}
              </View>

              <BeltNav app={this} />

              {this.isRelease == false ? (
                <View name="test-buttons" style={styles.buttonContainer}>
                  <DebugButton iconName='eye-settings' text='app settings' onPress={() => {Linking.openSettings()}} />
                  <DebugButton iconName='camera-switch' text='swap cam' onPress={this.switchCamera} />
                  {/* <DebugButton iconName='exclamation' text='dialog' onPress={this.showNativeDialog} /> */}
                  {/*<DebugButton iconName='bell-alert' text='alert' onPress={this.showSnackbar} />*/}
                  {/* <DebugButton iconName='drama-masks' text='change mask' onPress={this.onChangeEffect} /> */}
                  {this.state.userLoggedIn ? <DebugButton style={{backgroundColor: '#aea'}} iconName='thumb-up' text='authed' onPress={() => {}} />
                    : <DebugButton iconName='login' text='login' onPress={this.loginAnon} />
                  }
                </View>
              ) : <></>}

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

