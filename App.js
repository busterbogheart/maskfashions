"use strict";

import React from 'react';
import { Text, View, PermissionsAndroid, Platform, SafeAreaView, FlatList, Image, Dimensions } from 'react-native';
import DeepARModuleWrapper from './src/DeepARModuleWrapper';
import InAppBrowserWrapper from './src/InAppBrowserWrapper';
import Share from 'react-native-share';
import AdButler from './src/AdsApiAdButler';
import styles from './src/styles';
import MaskedView from '@react-native-masked-view/masked-view';
import { Button, Snackbar, Appbar, BottomNavigation } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import MFDropdown from './src/MFDropdown';
import DeviceInfo from 'react-native-device-info';
import firestore, { firebase } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInHours, differenceInSeconds } from 'date-fns';

export default class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      permissionsGranted: Platform.OS === 'ios',
      switchCameraInProgress: false,
      currentTexture: 0,
      selectedItems: [],
      alertVisible: false,
      userLoggedIn: false,
    }

    this.userId = null;
    this.authUnsub = null;
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
    console.debug(`event sent from native: ${event.type}`);
    if (event.type === 'cameraSwitch') {
      this.setState({ switchCameraInProgress: false })
    } else if (event.type === 'initialized') {

    } else if (event.type === 'didStartVideoRecording') {

    } else if (event.type === 'didFinishVideoRecording') {

    } else if (event.type === 'recordingFailedWithError') {

    } else if (event.type === 'screenshotTaken') {
      this.screenshotTaken(event.value)
    } else if (event.type === 'didSwitchEffect') {

    } else if (event.type === 'imageVisibilityChanged') {

    }
  }

  onChangeEffect = (direction) => {
    if (!this.deepARView) {
      return
    }

    this.deepARView.switchEffect('mask-08','effect');

    return;

    const { currentTexture: currentEffectIndex } = this.state
    var newIndex = direction > 0 ? currentEffectIndex + 1 : currentEffectIndex - 1
    if (newIndex >= effectsData.length) {
      newIndex = 0
    }
    if (newIndex < 0) {
      newIndex = effectsData.length - 1
    }

    const newEffect = effectsData[newIndex]
    this.deepARView.switchEffect(newEffect.name, 'effect')

    this.setState({ currentEffectIndex: newIndex })

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
    const { switchCameraInProgress } = this.state;
    if (!switchCameraInProgress && this.deepARView) {
      this.setState({ switchCameraInProgress: true });
      this.deepARView.switchCamera();
    }
  }

  showAlert = (text = '') => {
    this.setState({ alertVisible: true });
  }

  componentDidMount() {
    console.debug('componentdidmount');
    if (Platform.OS === 'android') {
      PermissionsAndroid.requestMultiple(
        [
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        ]
      ).then(result => {
        if (
          result['android.permission.CAMERA'].match(/^granted|never_ask_again$/) &&
          result['android.permission.WRITE_EXTERNAL_STORAGE'].match(/^granted|never_ask_again$/) &&
          result['android.permission.RECORD_AUDIO'].match(/^granted|never_ask_again$/)) {
          this.setState({ permissionsGranted: true, showPermsAlert: false });
        } else {
          this.setState({ permissionsGranted: false, showPermsAlert: true });
        }
      })
    }

    //new AdButler();

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
      }, reason => console.warn('failed: ' + reason));
      
      //adItems();
      //preloadAdItemImages();
      //adItemTagSchema();
      
      const adData = [
        { bannerId: 555225, creative_url: 'https://editorialist.com/wp-content/uploads/2020/10/il_1588xN.2622401929_hwdx.jpg', },
        { bannerId: 442225, creative_url: 'https://servedbyadbutler.com/getad.img/;libID=3185174', },
        { bannerId: 742110, creative_url: 'https://servedbyadbutler.com/getad.img/;libID=3185097', },
        { bannerId: 844044, creative_url: 'https://maskfashions-cdn.web.app/02-jklm_skullflowers.jpg', },
      ];
    }
    
    // authed user and device unique id required for favorites.  
    // device unique id not required for auth.
    // get them separately but ensure both exist later for r/w favorites.
    checkFavorites = () => {
      if(this.state.userLoggedIn === false || this.userId == null){
        console.debug(`checkfavs user ${this.userId} not authed or null user, auth ${this.state.userLoggedIn}`);
        return;
      }

      console.debug(`checking favs for ${this.userId}`);
      const favsData = firestore().collection('users').doc(this.userId).get()
        .then( doc => {
          console.debug(`favs for ${this.userId}?`);
          if(doc.exists){
            console.debug('got user doc', doc.data());
          } else {
            //TODO
            // show tutorial, cta to add
            console.info('doc no existo for ',this.userId)
          }
        })
        .catch( e => console.warn(`doc get failed for ${this.userId}`,e));
  }


  addToFavorites = () => {
    if(this.state.userLoggedIn === false || this.userId == null){
      console.debug(`addtofavs user ${this.userId} not authed or null user, auth ${this.state.userLoggedIn}`);
      return;
    }

    console.debug(`setting favorites for ${this.userId}`)
    const adItemId = String(Math.floor(Math.random()*99999));
    let userDoc = firestore().collection('users').doc(this.userId);
    userDoc.get()
      .then(doc => {
        // update; will also create favorites field if it doesnt exist
        if(doc.exists){
          userDoc.update({
            favorites: firestore.FieldValue.arrayUnion(adItemId),
          })
          .then(()=> console.log('firestore update successful'))
          .catch( e => console.error(e));
          // create
        } else {
          userDoc.set({
            favorites: [adItemId],
          })
            .then(()=> console.log('firestore set successful'))
            .catch( e => console.error(e));
        }
      })
      .catch( e => console.error(e));
  }

  setupUserLocal = async () => {
    // awaits exit the async function, giving control elsewhere until promise returns
    let userId = await AsyncStorage.getItem('userId')
    console.log('userId from local ', userId, `authed? ${this.state.userLoggedIn}`);
    if (userId == null) {
      try {
        userId = DeviceInfo.getUniqueId();
        console.log('userId from device ', userId);
        await AsyncStorage.setItem('userId', userId);
      } catch (e) {
        console.warn(e);
        try {
          userId = DeviceInfo.getUniqueId();
          await AsyncStorage.setItem('userId', userId);
        } catch (e) {
          console.warn('second setItem failed', e);
        }
      }
    }
    this.userId = userId;
    console.log(`userId from ${Platform.OS} device`, userId);

    let lastLogin = await AsyncStorage.getItem('userLastLogin');
    let isFirstLogin = Boolean(lastLogin) == false;
    console.debug('last login from local:', lastLogin, `is first? ${isFirstLogin}`);

    if (!isFirstLogin) {
      let lastLoginDate = new Date(JSON.parse(lastLogin));
      // let hoursSinceLast = differenceInHours(Date.now(), lastLoginDate);
      // console.log(`last login: ${lastLoginDate}, been ${hoursSinceLast}h`);
      console.log(`last login: ${lastLoginDate}, been ${differenceInSeconds(Date.now(), lastLoginDate)}s`);
    }

    // record current login for all users
    let now = JSON.stringify(Date.parse(new Date()));
    try {
      await AsyncStorage.setItem('userLastLogin', now);
    } catch (e) {
      console.warn(e);
      // do it again!
      try {
        await AsyncStorage.setItem('userLastLogin', now);
      } catch (e) {
        console.warn('double failed setItem', e);
      }
    }

    return userId;
  }

  setupAuthListener = () => {
    // returns unsub function
    this.authUnsub = firebase.auth().onAuthStateChanged( authUser => {
      if(this.state.userLoggedIn===true && !authUser){
        console.debug(`auth state change, logged out`);
        this.setState({userLoggedIn: false});
      } else if ( this.state.userLoggedIn===false && authUser){
        console.debug(`auth state change, logged in:`, authUser);
        this.setState({userLoggedIn: true});
      }
    });
  }

  loginAnon = () => {
    console.log('loginanon');
    firebase.auth().signInAnonymously()
      .then(()=>{console.debug('user signed in anon')})
      .catch(e => {
        console.error('unable to auth anon, trying again',e);
        firebase.auth().signInAnonymously()
          .then(()=> console.debug('user signed in anon second time') )
      });
  }

  // CDN urls should be parsed and pre-loaded, then also made available to Java and objc
  // on the local filesystem for the deepar native switchTexture method
  // try https://github.com/itinance/react-native-fs
  onChangeTexture = () => {
    let textureList = [
      { adId: '491', url: 'https://maskfashions-cdn.web.app/02-jklm_skullflowers.jpg' },
      { adId: '313', url: 'https://maskfashions-cdn.web.app/02-tintshues_coral.jpg' },
    ];
    let tex = textureList[this.state.currentTexture];
    this.state.currentTexture = this.state.currentTexture + 1 == textureList.length ? 0 : this.state.currentTexture + 1;
    this.deepARView.switchTexture(tex.url);
  }

  render() {
    console.info('render');

    var onEventSent = (event) => {
      const onEventSentCallback = this.props.onEventSent;
      console.log("RECEIVED message from native", event.nativeEvent, onEventSentCallback);

      if (onEventSentCallback) {
        onEventSentCallback(event.nativeEvent);
      }
    }

    let { ...props } = { ...this.props }; delete props.onEventSent;


    const { permissionsGranted } = this.state;
    const screenWidth =  Dimensions.get('window').width;

    const MyButton = (props) => {
      // also can use Icon.Button
      return <Button 
        style={[styles.button, props.style]} icon={props.iconName} mode='contained' compact={true} onPress={props.onPress} >
        {props.text}
      </Button>
    };

    const data = [
      { label: 'caqqqw', value: '1' },
      { label: 'few', value: '2' },
      { label: 'fcweeeeeeee q', value: '3' },
      { label: 'qwdd ', value: '4', custom: <Icon name='cpu' /> },
      { label: 'eeq eqw', value: '5', custom: <Icon name='box' /> },
    ];

    const routeRandom = () => <Text>random</Text>;
    const routeFav = () => <Text>fav</Text>;
    const routePhoto = () => <Text>photo</Text>;
    const routeClip = () => <Text>clip</Text>;
    const routeBuy = () => <Text>buy</Text>;

    const bottomNavScene = BottomNavigation.SceneMap({
      random: routeRandom,
      fav: routeFav,
      photo: routePhoto,
      clip: routeClip,
      buy: routeBuy,
    });
    const bottomNavRoutes = [
      { key: 'ere1', title: 'ert', icon: 'codesandbox' },
      { key: 'ere2', title: 'ert', icon: 'codesandbox' },
      { key: 'ere3', title: 'ert', icon: 'codesandbox' },
      { key: 'ere5', title: 'ert', icon: 'codesandbox' },
      { key: 'ere6', title: 'ert', icon: 'codesandbox' },
    ];

    return (
      <SafeAreaView style={styles.container}>

        <Snackbar 
          visible={this.state.alertVisible} duration={2000}
          onDismiss={() => { console.debug('dismiss?'); this.setState({ alertVisible: false }) }}
        // action={{label:'',onPress:()=>{}}} 
        >this is only a test</Snackbar>

        {/* <Appbar style={styles.appbar}>
          <Appbar.Content title='Mask Fashions' subtitle='have fun. be safe.' />
          <Appbar.Action icon='video' onPress={() => { }} />
          <Appbar.Action icon='gift' onPress={() => { }} />
        </Appbar> */}

        {/* <BottomNavigation
          renderScene={bottomNavScene}
          navigationState={ {index:0, routes:bottomNavRoutes} }
          onIndexChange={(index)=>{}}
        /> */}

        <View name="belt nav" style={styles.buttonContainer}>
          <MyButton iconName='camera' text='camera' onPress={this.switchCamera} />
          <MyButton iconName='anchor' text='change mask' onPress={this.onChangeEffect} />
          <MyButton iconName='activity' text='change texture' onPress={this.onChangeTexture} />
          <MyButton iconName='maximize' text='screenshot' onPress={this.takeScreenshot} />
          <MyButton iconName='gift' text='alert' onPress={this.showAlert} />
          {this.state.userLoggedIn ? <MyButton style={{backgroundColor:'#aea'}} iconName='thumbs-up' text='authed' onPress={()=>{}} /> 
          : <MyButton iconName='log-in' text='login' onPress={this.loginAnon} />
          }
          <MyButton iconName='heart' text='+fav' onPress={this.addToFavorites} />
          <MyButton iconName='list' text='view favs' onPress={this.checkFavorites} />
        </View>

        {/* <MFDropdown data={data} ></MFDropdown> */}

        <View name="DeepAR container" >
          {permissionsGranted ? 
            <DeepARModuleWrapper onEventSent={this.onEventSent} ref={ref => this.deepARView = ref} /> 
            : 
            <Text>permissions not granted</Text> }
        </View>

        <View name="mask scroll" style={styles.maskScroll(maskSize)}>
          <FlatList
            contentContainerStyle={{ alignItems: 'center', }}
            keyExtractor={(item, index) => item.id + item.picUrl}
            horizontal={true} data={listData} renderItem={renderItem} />
        </View>


        {/* <Text style={{fontSize:18}}><Icon name='cpu' size={18} />whoa</Text> */}

      </SafeAreaView>
    );
  }

}

let maskSize = 135;

let listData = new Array(20).fill(null).map(
  (v, i) => ({ key: i, picUrl: `https://picsum.photos/${maskSize}?${i}` })
);

let renderItem = ({ item, index, sep }) => {
  return (
    <MaskedView key={item.key} style={styles.maskScrollItem(maskSize)}
      maskElement={
        <View style={{ backgroundColor: 'transparent', flex: 1, justifyContent: 'center', alignItems: 'center', }}>
          <Image style={{ width: maskSize, height: maskSize }} source={require('./assets/images/maskmask.png')} ></Image>
        </View>
      }>
      <View style={{ flex: 1, height: '100%', }} >
        <Image style={{ width: maskSize, height: maskSize, }} source={{ uri: item.picUrl }} />
      </View>
    </MaskedView>
  )
};
