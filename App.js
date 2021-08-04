"use strict";

import React from 'react';
import { View, PermissionsAndroid, Platform, SafeAreaView, FlatList, Image } from 'react-native';
import DeepARViewAndroid from './src/DeepARViewAndroid';
import DeepARIOS from './src/DeepARIOSView';
import InAppBrowserWrapper from './src/InAppBrowserWrapper';
import Share from 'react-native-share';
import AdButler from './src/AdsApiAdButler';
import styles from './src/styles';
import MaskedView from '@react-native-masked-view/masked-view';
import { Appbar, Button, Divider, Snackbar }  from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import { ListContainer } from './src/List';
import MFDropdown from './src/MFDropdown';

export default class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      permissionsGranted: Platform.OS === 'ios',
      switchCameraInProgress: false,
      displayText: '',
      currentTexture: 0,
      selectedItems: [],
      alertVisible: false,
    }
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

    this.deepARView.switchEffect('mask-08');

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

  showAlert = (text='') => {
    this.setState({alertVisible:true});
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

    // new AdButler();
  }

  // CDN urls should be parsed and pre-loaded, then made available to Java and objc
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

    let deepArElement;
    if (Platform.OS === 'android')
      deepArElement = <DeepARViewAndroid onEventSent={this.onEventSent} ref={ref => this.deepARView = ref} />
    else if (Platform.OS === 'ios')
      deepArElement = <DeepARIOS />;

    const { permissionsGranted } = this.state;

    const MyButton = (props) => {
      // also can use Icon.Button
      return <Button style={styles.button} icon={props.iconName} mode='contained' compact={true} onPress={props.onPress} >
        {props.text}
      </Button>
    };
    const data = [
      {label:'caqqqw', value:'1'},
      {label:'few', value:'2'},
      {label:'fcweeeeeeee q', value:'3'},
      {label:'qwdd ', value:'4', custom: <Icon name='cpu' /> },
      {label:'eeq eqw', value:'5', custom: <Icon name='box' /> },
    ];

    return (
      <SafeAreaView style={styles.container}>
        <Snackbar 
          visible={this.state.alertVisible}  duration={2000}
          onDismiss={()=>{console.debug('dismiss?'); this.setState({alertVisible:false})}} 
          // action={{label:'',onPress:()=>{}}} 
          >this is only a test
        </Snackbar>


        <MFDropdown data={data} ></MFDropdown>


        {/* {permissionsGranted ? <View style={{flexDirection:'column',justifyContent:'space-around'}}>{deepArElement}</View> :
        <Text>permissions not granted</Text>} */}

        <View style={styles.buttonContainer}>
          <MyButton iconName='camera' text='camera' onPress={this.switchCamera} />
          <MyButton iconName='external-link' text='browser' onPress={InAppBrowserWrapper.onLogin} />
          <MyButton iconName='anchor' text='change mask' onPress={this.onChangeEffect} />
          <MyButton iconName='activity' text='change texture' onPress={this.onChangeTexture} />
          <MyButton iconName='maximize' text='screenshot' onPress={this.takeScreenshot} />
          <MyButton iconName='gift' text='alert' onPress={this.showAlert} />
        </View>

        <View style={styles.flatlist(maskSize)}>
          <FlatList
            contentContainerStyle={{ alignItems: 'center', }}
            keyExtractor={(item, index) => item.id + item.picUrl}
            horizontal={true} data={listData} renderItem={renderItem} />
        </View>


        {/* <Appbar style={styles.appbar}>
          <Appbar.Action icon='book-open' onPress={()=>{}} />
        </Appbar> */}

        {/* <Text style={{fontSize:18}}><Icon name='cpu' size={18} />whoa</Text> */}

      </SafeAreaView>
    );
  }

}

let maskSize = 135;

let listData = new Array(20).fill(null).map(
  (v,i) => ({key:i, picUrl: `https://picsum.photos/${maskSize}?${i}`})
);

let renderItem = ({ item, index, sep }) => {
  return (
    <MaskedView key={item.key} style={styles.flatlistItem(maskSize)}
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
