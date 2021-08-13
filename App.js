"use strict";

import React from 'react';
import { Text, View, PermissionsAndroid, Platform, SafeAreaView, FlatList, Image, Dimensions, Alert, TouchableOpacity, ScrollView } from 'react-native';
import DeepARModuleWrapper from './src/components/DeepARModuleWrapper';
import Share from 'react-native-share';
import AdButler from './src/AdsApiAdButler';
import { styles } from './src/styles';
import MaskedView from '@react-native-masked-view/masked-view';
import { Button, Snackbar, Modal, Portal, Dialog, Paragraph, Appbar, Menu } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MFDropdown from './src/MFDropdown';
import DeviceInfo from 'react-native-device-info';
import firestore, { firebase } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInHours, differenceInMilliseconds, differenceInSeconds } from 'date-fns';
import BeltNav from './src/components/BeltNav';
import BottomNav from './src/components/BottomNav';
import SideMenu from 'react-native-side-menu-updated';
import DrawerMenu from './src/components/DrawerMenu';

export default class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      permissionsGranted: Platform.OS === 'ios',
      switchCameraInProgress: false,
      currentTexture: 0,
      selectedItems: [],
      alertVisible: false,
      dialogVisible: false,
      drawerVisible: false,
      userLoggedIn: false,
    }

    this.userId = null;
    this.authUnsub = null;
    this.maskSize = 220;
    this.textureList = [
      { adId: '314524t', url: 'https://maskfashions-cdn.web.app/mask-model-09-tintshues-bluechecked.jpg' },
      { adId: '3145644t', url: 'https://maskfashions-cdn.web.app/mask-model-09-geekchic-prism.jpg' },
      { adId: '3146264t', url: 'https://maskfashions-cdn.web.app/mask-model-09-janice-flowerswhite.jpg' },
      { adId: '314254t', url: 'https://maskfashions-cdn.web.app/mask-model-09-jklm-skullflowers.jpg' },
      { adId: '31223563', url: 'https://maskfashions-cdn.web.app/mask-09-geekchic-microfloral1024.jpg' },
    ];
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
      this.deepARView.switchEffect('mask-09', 'effect');
      // this.switchToNextTexture();
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

  showNativeDialog = () => {
    Alert.alert(
      "Here's the deal",
      "Some explanation of how the buy button will act.",
      [
        { text: 'ok' },
        { text: 'less than ok', style: 'cancel' },
        { text: 'VERY ok', style: 'destructive' },
      ],
      { cancelable: true }
    );
  }

  showDialog = () => this.setState({ dialogVisible: true });
  hideModal = () => this.setState({ dialogVisible: false });

  showDrawer = () => this.setState({ drawerVisible: true });
  hideDrawer = () => this.setState({ drawerVisible: false });

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
          this.setState({ permissionsGranted: true });
        } else {
          this.setState({ permissionsGranted: false });
        }
      })
    }

    let butler = new AdButler();
    let allAds;
    butler.getAdItems().then(ads => {
      allAds = ads;
      // loaded
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
      }, reason => console.warn('failed: ' + reason));

    //adItems();
    this.preloadAdItemImages();
    //adItemTagSchema();
  }

  // CDN urls should be parsed and pre-loaded for the listview, and also made available 
  // to Java and objc on local filesystem for the deepar native switchTexture method
  // save resized copy for listview?  performance?
  // try https://github.com/itinance/react-native-fs
  preloadAdItemImages = () => {
    this.textureList.forEach(v => {
      let uri = v.url;
      console.debug(`preloading texture ${uri}`);
      Image.prefetch(uri)
        .then(
          successBool => {},
          failReason => console.warn(failReason))
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
    const favsData = firestore().collection('users').doc(this.userId).get()
      .then(doc => {
        console.debug(`favs for ${this.userId}?`);
        if (doc.exists) {
          console.debug('got user doc', doc.data());
        } else {
          //TODO
          // show tutorial, cta to add
          console.info('doc no existo for ', this.userId)
        }
      })
      .catch(e => console.warn(`doc get failed for ${this.userId}`, e));
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
            .catch(e => console.error('firestore set error', e));
        }
      })
      .catch(e => console.error('firestore get() error', e));
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
    this.authUnsub = firebase.auth().onAuthStateChanged(authUser => {
      if (this.state.userLoggedIn === true && !authUser) {
        console.debug(`auth state change, logged out`);
        this.setState({ userLoggedIn: false });
      } else if (this.state.userLoggedIn === false && authUser) {
        console.debug(`auth state change, logged in:`, authUser);
        this.setState({ userLoggedIn: true });
      }
    });
  }

  loginAnon = () => {
    console.log('loginanon');
    firebase.auth().signInAnonymously()
      .then(() => { console.debug('user signed in anon') })
      .catch(e => {
        console.error('unable to auth anon, trying again', e);
        firebase.auth().signInAnonymously()
          .then(() => console.debug('user signed in anon second time'))
      });
  }

  switchToNextTexture = () => {
    let tex = this.textureList[this.state.currentTexture];
    this.state.currentTexture = this.state.currentTexture + 1 == this.textureList.length ? 0 : this.state.currentTexture + 1;
    this.deepARView.switchTexture(tex.url);
  }

  switchTexture = (url) => {
    this.deepARView.switchTexture(url);
  }

  switchToRandomTexture = () => {

  }

  renderItem = ({ item, index, sep }) => {
    const maskmask = './assets/images/maskmask.png';
    // TODO check androidrenderingmode software
    return (
      <MaskedView key={Number(item.adId)} style={styles.maskScrollItem(this.maskSize)}
        maskElement={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
            <Image key={Date.now()} style={{ width: this.maskSize - 50, height: this.maskSize - 50 }} width={this.maskSize - 50} height={this.maskSize - 50}
              source={require(maskmask)} ></Image>
          </View>
        }>
        <TouchableOpacity onPressIn={() => { this.switchTexture(item.url) }} delayPressIn={100} activeOpacity={.5} >
          <Image
            fadeDuration={100} progressiveRenderingEnabled={true}
            style={{ width: this.maskSize, height: this.maskSize, top: -40 }} key={Date.now() + item.adId}
            width={this.maskSize} height={this.maskSize} source={{ uri: item.url }} />
        </TouchableOpacity>
      </MaskedView>
    )
  };

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
    const screenWidth = Dimensions.get('window').width;

    const MyButton = (props) => {
      // also can use Icon.Button
      return <Button
        style={[styles.button, props.style]} icon={props.iconName} mode='contained' compact={true} onPress={props.onPress} >
        <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{props.text}</Text>
      </Button>
    };

    const data = [
      { label: 'caqqqw', value: '1' },
      { label: 'few', value: '2' },
      { label: 'fcweeeeeeee q', value: '3' },
      { label: 'qwdd ', value: '4', custom: <Icon name='box' /> },
      { label: 'eeq eqw', value: '5', custom: <Icon name='box' /> },
    ];

    return (
      <SideMenu menu={<DrawerMenu app={this} />} openMenuOffset={140} menuPosition='right' isOpen={this.state.drawerVisible} onChange={(isOpen) => { this.setState({ drawerVisible: isOpen }) }} >

        <Portal>
          <Snackbar
            visible={this.state.alertVisible} duration={2000}
            onDismiss={() => { console.debug('dismiss?'); this.setState({ alertVisible: false }) }}
          // action={{label:'',onPress:()=>{}}} 
          >this is only a test ({Platform.Version}) <Icon name='check-circle-outline' /></Snackbar>
        </Portal>

        <Portal>
          <Dialog style={{ width: 100, height: 150, backgroundColor: 'transparent' }} visible={this.state.dialogVisible} onDismiss={this.hideModal}
            contentContainerStyle={{ padding: 20, margin: 40 }} style={{ marginVertical: 40 }}>
            <Dialog.Title>Buy button explanation</Dialog.Title>
            <Dialog.Content><Paragraph>Well, here's the deal</Paragraph></Dialog.Content>
          </Dialog>
        </Portal>

        <Appbar.Header style={styles.appbar}>
          <Appbar.Content titleStyle={{ fontSize: 15, fontWeight: 'bold' }} subtitleStyle={{ fontSize: 11, }} title='Mask Fashions' subtitle='Stay safe. Look good.' />
          <Appbar.Action size={32} icon='menu' onPress={this.showDrawer} />
        </Appbar.Header>

        <View name="DeepAR container" style={styles.deeparContainer}>
          {permissionsGranted ?
            <DeepARModuleWrapper onEventSent={this.onEventSent} ref={ref => this.deepARView = ref} />
            :
            <Text>permissions not granted</Text>}
        </View>

        <BeltNav app={this} />

        {/* <MaskedView key='3errrrrr' maskElement={
              <View style={{ backgroundColor: 'transparent', flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                <Image key={Date.now()} style={{ width: 50, height: 50 }} width={50} height={50} source={require('./assets/images/maskmask.png')} ></Image>
              </View>
            }>
            <Image fadeDuration={100} progressiveRenderingEnabled={true}
              style={{ width: 50, height: 50 }} key={Date.now()}
              width={50} height={50} source={{ uri: this.textureList[0].url }} />
          </MaskedView>
  */}
        <View name="test-buttons" style={styles.buttonContainer}>
          <MyButton iconName='camera-switch' text='swap cam' onPress={this.switchCamera} />
          {/* <MyButton iconName='ticket' text='change texture' onPress={this.switchToNextTexture} /> */}
          {/* <MyButton iconName='exclamation' text='dialog' onPress={this.showNativeDialog} /> */}
          <MyButton iconName='bell-alert' text='alert' onPress={this.showAlert} />
          {/* <MyButton iconName='projector-screen' text='dialog' onPress={this.showDialog} /> */}
          {/* <MyButton iconName='drama-masks' text='change mask' onPress={this.onChangeEffect} /> */}
          {this.state.userLoggedIn ? <MyButton style={{ backgroundColor: '#aea' }} iconName='thumb-up' text='authed' onPress={() => {}} />
            : <MyButton iconName='login' text='login' onPress={this.loginAnon} />
          }
        </View>

        {/* <MFDropdown data={data} ></MFDropdown> */}

        <View name="mask scroll" style={styles.maskScroll(this.maskSize)}>
          <FlatList
            contentContainerStyle={{ alignItems: 'center', }}
            keyExtractor={(item, index) => item.adId}
            horizontal={true} data={this.textureList} renderItem={this.renderItem} />
        </View>

        {/* <BottomNav app={this} /> */}

        {/* <Text style={{fontSize:18}}><Icon name='heart' size={18} />whoa</Text> */}

      </SideMenu>
    );
  }

}

