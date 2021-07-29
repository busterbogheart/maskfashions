"use strict";

import React from 'react';
import { StyleSheet, Linking, Text, View, TouchableOpacity, PermissionsAndroid, Dimensions, Platform, AppState, SafeAreaView, FlatList, Image } from 'react-native';
import DeepARViewAndroid from './src/DeepARViewAndroid';
import DeepARIOS from './src/DeepARIOSView';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
// import Icon from 'react-native-vector-icons/MaterialIcons';
import InAppBrowserWrapper from './src/InAppBrowserWrapper';
import Share from 'react-native-share';
import AdButler from './src/AdsApiAdButler';
import MaskedView from '@react-native-masked-view/masked-view';

const items = [
  {
    name: 'Fruits',
    id: 0,
    // these are the children or 'sub items'
    children: [
      {
        name: 'Apple',
        id: 10,
      },
      {
        name: 'Strawberry',
        id: 17,
      },
      {
        name: 'Pineapple',
        id: 13,
      },
      {
        name: 'Banana',
        id: 14,
      },
      {
        name: 'Watermelon',
        id: 15,
      },
      {
        name: 'Kiwi fruit',
        id: 16,
      },
    ],
  },
];

export default class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      permissionsGranted: Platform.OS === 'ios',
      switchCameraInProgress: false,
      displayText: '',
      currentTexture: 0,
      selectedItems: [],
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

  selectItem = (selectedItems) => {
    this.setState({ selectedItems });
  };

  // CDN urls should be parsed and pre-loaded, then made available to Java and objc on the local filesystem
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

    let { ...props } = { ...this.props };
    delete props.onEventSent;

    let deepArElement;
    if (Platform.OS === 'android')
      deepArElement = <DeepARViewAndroid onEventSent={this.onEventSent} ref={ref => this.deepARView = ref} />
    else if (Platform.OS === 'ios')
      deepArElement = <DeepARIOS />;

    const { permissionsGranted } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        {permissionsGranted ?
        <View style={{flexDirection:'column',justifyContent:'space-around'}}>{deepArElement}</View> :
        <Text>permissions not granted</Text>}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => InAppBrowserWrapper.onLogin()}><Text>in app browser</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => this.switchCamera()}><Text>switch camera</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => this.onChangeEffect()}><Text>change mask</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => this.onChangeTexture()}><Text>switch texture</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => this.takeScreenshot()}><Text>take photo</Text></TouchableOpacity>
        </View>

        {/* <SectionedMultiSelect styles={{backgroundColor:"#ff0"}} 
         items={items} uniqueKey="id" IconRenderer={Icon}
          onSelectedItemsChange={this.selectItem}  /> */}

        <View style={styles.flatlist}>
          <FlatList
            contentContainerStyle={{ alignItems: 'center', }}
            keyExtractor={(item, index) => item.id + item.picUrl}
            horizontal={true} data={listData} renderItem={renderItem} />
        </View>


      </SafeAreaView>
    );
  }

}

let listData = [
  {
    id: 1,
    picUrl: 'https://picsum.photos/100?',
  },
  {
    id: 2,
    picUrl: 'https://picsum.photos/100?2',
  },
  {
    id: 3,
    picUrl: 'https://picsum.photos/100?3',
  },
  {
    id: 4,
    picUrl: 'https://picsum.photos/100?4',
  },
  {
    id: 5,
    picUrl: 'https://picsum.photos/100?5',
  },
  {
    id: 6,
    picUrl: 'https://picsum.photos/100?6',
  },
  {
    id: 7,
    picUrl: 'https://picsum.photos/100?7',
  },
];

let renderItem = ({ item, index, sep }) => {
  return (
    <MaskedView key={item.id} style={styles.flatlistItem}
      maskElement={
        <View style={{ backgroundColor: 'transparent', flex: 1, justifyContent: 'center', alignItems: 'center', }}>
          <Image style={{ width: 100, height: 100 }} source={require('./assets/images/maskmask.png')} ></Image>
        </View>
      }>
      <View style={{ flex: 1, height: '100%', backgroundColor: getRandomColor() }} >
        <Image style={{ width: 100, height: 100 }} source={{ uri: item.picUrl }} />
      </View>
    </MaskedView>
  )
};

let getRandomColor = () => { return 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')'; }

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    // alignContent: 'flex-end', //cross axis with flexWrap on, overrides alignContent of parent
    // flexWrap: 'wrap',
    justifyContent: 'flex-end',   // main axis
    alignItems: 'center', // cross axis
    backgroundColor: '#333'//'moccasin',
  },
  buttonContainer:{
    height: 200,
    flexWrap: 'wrap',  //set on container,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignSelf: 'stretch', // overrides parent's alignItems
  },
  button: {
    backgroundColor: '#cfe',
    width: 130,
    padding: 10,
    margin: 4,
    alignItems: 'center',
  },
  flatlist: {
    height: 110,
    flexDirection: 'row',
    backgroundColor: '#666',
  },
  flatlistItem: {
    marginRight: 20,
    height: 100,
    width: 100,
  },
  deeparview: {
    flex: 1,
    width: 100,//width,
    height: 100,//'100%',
  }
});
