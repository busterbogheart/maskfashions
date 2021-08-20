"use strict";

import React from 'react';
import {Share as RNShare,Text,View,PermissionsAndroid,Platform,FlatList,Image,Alert,TouchableOpacity,SafeAreaView,Dimensions,useWindowDimensions} from 'react-native';
import Share from 'react-native-share';
import AdButler from './src/AdsApiAdButler';
import {filterModalStyles,styles,theme} from './src/styles';
import MaskedView from '@react-native-masked-view/masked-view';
import {Button,Snackbar,Portal,Appbar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DeviceInfo from 'react-native-device-info';
import firestore,{firebase} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {differenceInHours,differenceInMilliseconds,differenceInSeconds} from 'date-fns';
import DeepARModuleWrapper from './src/components/DeepARModuleWrapper';
import BeltNav from './src/components/BeltNav';
import SideMenu from 'react-native-side-menu-updated';
import SideMenuContent from './src/components/SideMenuContent';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import FilterSchema from './src/FilterSchema';

export default class App extends React.Component {

  constructor(props) {
    super(props);
    console.debug('\n\n__________SESSION START__________________________');

    this.state = {
      permissionsGranted: Platform.OS === 'ios',
      switchCameraInProgress: false,
      currentTexture: 0,
      multiSelectedItems: [],
      multiSelectedItemObjects: [],
      snackbarVisible: false,
      snackbarText: null,
      sidemenuVisible: false,
      userLoggedIn: false,
      sideMenuData: null,
      forceRenderFlatList: true,
    }

    this.renderCount = 0;
    this.isRelease = true;

    this.userId = null; //from unique device id
    this.authUnsub = null; // function for unsubscribing from auth changes
    this.screenWidth = Dimensions.get('window').width;
    this.masterItemList = [];
    this.filteredItemList = [];
    
    this.multiSelectData = [];
    this.firstTimeFace = null;
    this.viewabilityConfig = {
      minimumViewTime: 1000,
      //viewAreaCoveragePercentThreshold: 80,
      itemVisiblePercentThreshold: 30,
      waitForInteraction: false,
    };
    this.adsAlreadyViewed = [];
    this.maskScrollRef = React.createRef();
    this.maskSizeScale = .77;
    this.maskSize = this.screenWidth / 1.3;
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
      this.deepARView.switchEffect('mask-09','effect');
      if (Platform.OS == 'android') this.switchToNextTexture();
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
      if (faceIsDetected && this.firstTimeFace) {
        clearTimeout(this.firstTimeFace);
        this.firstTimeFace = null;
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
    this.setState({snackbarText: text});
    this.setState({snackbarVisible: true});
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

    this.preloadMaskPNG();

    this.firstTimeFace = setTimeout(() => {
      this.showSnackbar(<Text>Having trouble?  It may be too dark. <Icon name='lightbulb-on' size={18} color={theme.colors.text} /></Text>);
    },8000);

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
          this.setState({permissionsGranted: true});
        } else {
          this.setState({permissionsGranted: false});
        }
      })
    }

    /*
    1. get ad items, filter schema
    2. preload texture CDN URLs
    3. (save textures locally?)
    */
   
    let schema;
    let butler = new AdButler();
    // currently also populates filterSchema
    butler.getAdItemsWithSchema().then(allAds => {
      for (let ad of allAds) {
        this.masterItemList.push({
          adId: String(ad.id),
          url: ad.creative_url,
          name: ad.name,
          metadata: ad.metadata,
        });
      }
      this.filteredItemList = this.masterItemList;
      butler.getAdTrackingURLS();
      console.debug('got ads and filter schema');
      schema = new FilterSchema(butler.getFilterSchema());
      this.multiSelectData = schema.filterAndReturnFilteredSchema(this.masterItemList);
      this.setState({});
    });

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

    this.preloadAdItemImages();
  }

  // CDN urls should be parsed and pre-loaded for the listview, and also made available 
  // to Java and objc on local filesystem for the deepar native switchTexture method
  // save resized copy for listview?  performance?
  // try https://github.com/itinance/react-native-fs
  preloadAdItemImages = () => {
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
    this.setState({sideMenuData: <Text style={{padding: 20, fontSize:20}}>DISCLAIMER</Text>});
  }

  addToFavorites = () => {
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

  switchToNextTexture = () => {
    let tex = this.filteredItemList[this.state.currentTexture];
    this.state.currentTexture = this.state.currentTexture + 1 == this.filteredItemList.length ? 0 : this.state.currentTexture + 1;
    this.deepARView.switchTexture(tex.url);
  }

  switchTexture = (url) => {
    this.deepARView.switchTexture(url);
  }

  switchToRandomAdItem = () => {
    this.maskScrollRef.current.scrollToIndex({
      index: Math.floor(Math.random() * this.filteredItemList.length),
      viewOffset: (this.screenWidth - this.maskSize) / 2,
    })
  }

  shareApp = () => {
    Share.open({
      message: 'it\'s Mask Fashions!',
      title: 'Mask Fashions?',
      url: 'http://maskfashions.app',
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
      if (this.adsAlreadyViewed.includes(adId) == false) {
        console.log('logging impression: ',v.index,adId)
        let url = 'https://maskfashions.app?';
        this.trackImpression(url);
        this.adsAlreadyViewed.push(adId);
      }
    }
  }

  applyFilters = () => {
    let filters = this.state.multiSelectedItemObjects;
    console.log('filters: ',JSON.stringify(filters,null,1));
    if (filters.length == 0) {
      this.resetFlatList();
      return;
    }
    
    let tempMasterList = [...this.masterItemList];
    let filtered = tempMasterList.filter((item,i,arr) => {
      let itemMetadata = JSON.stringify(item.metadata);
      console.log(itemMetadata);
      // run all filters on each one, any fail gets kicked
      for (let filter of filters) {
        let allMatch = true;
        if (filter.type == 'toggle') {
          //console.log('toggle',filter.name);
          allMatch = (itemMetadata.indexOf(filter.name) !== -1);
        } else if(filter.type == 'category') {
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
    console.log(this.filteredItemList);
    this.maskScrollRef.current.scrollToOffset({offset: 0, animated:false, });
    this.setState({forceRenderFlatList: !this.state.forceRenderFlatList});
  }
  
  resetFlatList = () => {
    console.log(this.filteredItemList);
    this.filteredItemList = this.masterItemList;
    this.maskScrollRef.current.scrollToOffset({offset: 0, animated:true, });
    this.setState({multiSelectedItems: [], multiSelectedItemObjects: [], forceRenderFlatList: !this.state.forceRenderFlatList});
  }


  renderItem = ({item,index,sep}) => {
    // TODO check androidrenderingmode software
    return (
      <TouchableOpacity style={styles.maskScrollItem(this.maskSize)}
        onPressIn={() => {this.switchTexture(item.url)}} delayPressIn={80} activeOpacity={.5} >
        <MaskedView key={Number(item.adId)}
          maskElement={
            <View style={{flex: 1,justifyContent: 'center',alignItems: 'center'}}>
              <Image key={Date.now()} style={{width: this.maskSize * this.maskSizeScale,height: this.maskSize * this.maskSizeScale}} width={this.maskSize * this.maskSizeScale} height={this.maskSize * this.maskSizeScale}
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

    const MyButton = (props) => {
      // also can use Icon.Button
      return <Button
        style={[styles.button,props.style]} icon={props.iconName} mode='contained' compact={true} onPress={props.onPress} >
        <Text style={{fontSize: 11,fontWeight: 'bold'}}>{props.text}</Text>
      </Button>
    };

    const filterIconRenderer = ({name,size = 18,style}) => {
      let iconName;
      switch (name) {
        case 'search':
          iconName = 'card-search'
          break
        case 'keyboard-arrow-up':
          iconName = 'arrow-up-thick'
          break
        case 'keyboard-arrow-down':
          iconName = 'arrow-down-thick'
          break
        case 'close':
          iconName = 'close-box'
          break
        case 'check':
          iconName = 'check-bold' //check
          break
        case 'cancel':
          iconName = 'close'
          break
        default:
          iconName = null
          break
      }
      return <Icon style={style} size={size} name={iconName} />
    }

    return (
      <View style={styles.container} >
        <SideMenu menu={<SideMenuContent app={this} content={this.state.sideMenuData} />} bounceBackOnOverdraw={false} openMenuOffset={this.screenWidth / 2.2}
          menuPosition='left' isOpen={this.state.sidemenuVisible} overlayColor={'#00000066'}
          onChange={(isOpen) => {this.setState({sidemenuVisible: isOpen,sideMenuData: null})}}
        >
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
              <MyButton iconName='camera-switch' text='swap cam' onPress={this.switchCamera} />
              {/* <MyButton iconName='ticket' text='change texture' onPress={this.switchToNextTexture} /> */}
              {/* <MyButton iconName='exclamation' text='dialog' onPress={this.showNativeDialog} /> */}
              {/*<MyButton iconName='bell-alert' text='alert' onPress={this.showSnackbar} />*/}
              {/* <MyButton iconName='drama-masks' text='change mask' onPress={this.onChangeEffect} /> */}
              {this.state.userLoggedIn ? <MyButton style={{backgroundColor: '#aea'}} iconName='thumb-up' text='authed' onPress={() => {}} />
                : <MyButton iconName='login' text='login' onPress={this.loginAnon} />
              }
            </View>
          ) : <></>}

          <View name="mask scroll" style={styles.maskScroll(this.maskSize)} >
            <FlatList ref={this.maskScrollRef} decelerationRate={.95} extraData={this.state.forceRenderFlatList}
              snapToOffsets={new Array(this.filteredItemList.length).fill(null).map((v,i) => (i*this.maskSize) - (this.screenWidth-this.maskSize)/2)}
              ListEmptyComponent={
                <View style={{justifyContent: 'center',alignItems: 'center',alignContent:'center', width: this.screenWidth / 2}}>
                    <Icon name='emoticon-confused' size={30} color={theme.colors.text} />
                  <Text style={{fontSize: 15, }}>No results. Try removing some filters.</Text>
                </View>}
              contentContainerStyle={{alignItems: 'center',flexGrow:1, justifyContent:'center'}}
              keyExtractor={(item,index) => item.adId}
              horizontal={true} data={this.filteredItemList} renderItem={this.renderItem}
              onViewableItemsChanged={this.onViewableItemsChanged}
              viewabilityConfig={this.viewabilityConfig}
            />
          </View>

          <View name="filters" style={[styles.filtersContainer]}>
            {this.multiSelectData.length > 0 ?
              <>
                <View name="filter buttons" style={styles.filterButtons}>
                  <TouchableOpacity onPress={() => {this.multiSelectRef._toggleSelector()}} style={styles.filterButtonsFilter} >
                    <Icon name='format-list-bulleted-type' size={28} style={{paddingHorizontal: 5}} />
                    <Text style={{textTransform: 'uppercase',fontWeight: 'bold',fontSize: 15}}>filter</Text>
                  </TouchableOpacity>
                  {this.state.multiSelectedItems.length > 0 ?
                    <TouchableOpacity onPress={() => {
                      //this.multiSelectRef._removeAllItems();
                      this.resetFlatList();
                    }} style={styles.filterButtonsClear}>
                      <Text style={{color: theme.colors.error,fontSize: 15,fontWeight: 'bold'}}>clear</Text>
                    </TouchableOpacity>
                    : <></>}
                </View>
                <SectionedMultiSelect
                  ref={SectionedMultiSelect => this.multiSelectRef = SectionedMultiSelect}
                  styles={filterModalStyles}
                  colors={{
                    // confirm button bg, dropdown arrow color
                    primary: theme.colors.primary,
                    // check icon color
                    success: '#2a2',
                    // cancel button bg
                    cancel: '#333',
                    // main category bg
                    itemBackground: '#fff',
                    subItemBackground: '#fff',
                    // button text
                    selectToggleTextColor: theme.colors.text,
                  }}
                  items={this.multiSelectData}
                  IconRenderer={filterIconRenderer}
                  uniqueKey="id"
                  subKey="children"
                  selectText=''
                  //selectText={<><Text style={{textTransform: 'uppercase',fontWeight: 'bold',fontSize: 15}}>filter masks </Text><Icon name='format-list-bulleted-type' size={20} /></>}
                  showDropDowns={true}
                  selectChildren={false}
                  // remove down arrow at start
                  selectToggleIconComponent={<></>}
                  // removeAllText={<Text style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>clear filters<Icon name='delete' size={18} /></Text>}
                  expandDropDowns={false}
                  // headerComponent={<View style={{backgroundColor:'#f4f',height:20}}><Text>header</Text></View>}
                  // footerComponent={<View style={{backgroundColor:'#f4f',height:20}}><Text>foot</Text></View>}
                  // stickyFooterComponent={<View style={{backgroundColor:'#bfd',padding:5,height:30}}><Text style={{textAlign:'right'}}>hot tip: Be hot.</Text></View>}
                  readOnlyHeadings={false}
                  showRemoveAll={true}
                  animateDropDowns={false}
                  modalAnimationType='slide'
                  modalWithSafeAreaView={true}
                  modalWithTouchable={true}
                  hideSearch={true}
                  hideSelect={true}
                  showCancelButton={true}
                  showChips={false}
                  highlightChildren={true}
                  confirmText='APPLY'
                  selectedIconOnLeft={true}
                  selectedIconComponent={<Icon name='check-bold' color='#2c2' style={{paddingRight: 3}} />}
                  alwaysShowSelectText={false}
                  // customChipsRenderer={(uniqueKey, subKey, displayKey, items, selectedItems, colors, styles)=>{}}
                  onSelectedItemsChange={(items) => {
                    //console.debug('selecteditemschange:',JSON.stringify(items,null,1))
                    this.setState({multiSelectedItems: items});
                  }}
                  onSelectedItemObjectsChange={(itemsObj) => {
                    // returned as the original objects not just ids
                    console.debug('selecteditemsobjectchange:',JSON.stringify(itemsObj,null,1))
                    this.setState({multiSelectedItemObjects: itemsObj});
                  }}
                  selectedItems={this.state.multiSelectedItems}
                  onToggleSelector={(modalOpen) => {
                    console.log(`filter modal open? ${modalOpen}`);
                    if (modalOpen == false) this.applyFilters();
                  }}
                  onConfirm={this.applyFilters}
                  onCancel={() => {
                    this.resetFlatList();
                  }}
                />
              </>
              : <></>}
          </View>
        </SideMenu>
      </View>
    );
  }

}

