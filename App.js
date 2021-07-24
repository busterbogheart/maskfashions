"use strict";

import React from 'react';
import { StyleSheet, Linking, Text, View, Button, PermissionsAndroid, Dimensions, Platform, AppState, SafeAreaView, FlatList, Image } from 'react-native';
import DeepARViewAndroid from './src/DeepARViewAndroid';
import DeepARIOS from './src/DeepARIOSView';
import { AdItem,CampaignAssignment } from './src/AdsApiMapping';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import AdsApi from './src/AdsApi';
// import Icon from 'react-native-vector-icons/MaterialIcons';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import InAppBrowserWrapper from './src/InAppBrowserWrapper';


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
      currentEffectIndex: 0,
      selectedItems: [],
    }
  }
  
  didAppear() {
    console.debug('didappear');
    if (this.deepARView) {
      this.deepARView.resume();
    }
  }

  willDisappear(){
    console.debug('willdisappear');
    if (this.deepARView) {
      this.deepARView.pause();
    }
  }

  onEventSent = (event) => {
      if (event.type === 'cameraSwitch') {
        this.setState({switchCameraInProgress: false})
      } else if (event.type === 'initialized') {
        
      } else if (event.type === 'didStartVideoRecording') {
        
      } else if (event.type === 'didFinishVideoRecording') {
        
      } else if (event.type === 'recordingFailedWithError') {
       
      } else if(event.type === 'screenshotTaken') {
        this.screenshotTaken(event.value)
      } else if (event.type === 'didSwitchEffect') {
       
      } else if (event.type === 'imageVisibilityChanged') {

      }
  }

  onChangeEffect = (direction) => {
    if (!this.deepARView) {
      return
    }

    this.deepARView.switchEffect('aviators');

    return;

    const { currentEffectIndex } = this.state
    var newIndex = direction > 0 ? currentEffectIndex + 1 : currentEffectIndex - 1
    if ( newIndex >= effectsData.length ) {
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
    if(this.deepARView) {
      this.deepARView.takeScreenshot()
    }
  }

  screenshotTaken = (screenshotPath) => {
    const path ='file://'+screenshotPath;
    const transition = slideTransitionDefinition({ isVertical: true, direction: 1, duration: 200 })
    this.props.push('preview', transition, { screenshotPath: path})
  }

  switchCamera = () => {
    const { switchCameraInProgress} = this.state;
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
          result['android.permission.RECORD_AUDIO'].match(/^granted|never_ask_again$/) ) {
          this.setState({ permissionsGranted: true, showPermsAlert: false });
        } else {
          this.setState({ permissionsGranted: false, showPermsAlert: true });
        }
      })
    }

    const effects = [
      {
        name: 'aviators',
        title: 'Sick Sunnies'
      },
    ];
  }

  selectItem = (selectedItems) => {
    this.setState({ selectedItems });
  };

  render() {
    console.info('render');

    var onEventSent = (event) => {
      const onEventSentCallback = this.props.onEventSent;
      console.log("RECEIVED message from native", event.nativeEvent, onEventSentCallback);

      if(onEventSentCallback) {
        onEventSentCallback(event.nativeEvent);
      }
    }

    let {...props} = {...this.props};
    delete props.onEventSent;

    let deepArElement;
    if (Platform.OS === 'android')
    deepArElement = <DeepARViewAndroid style={styles.deeparview} onEventSent={this.onEventSent} ref={ ref => this.deepARView = ref }/>
    else if (Platform.OS === 'ios')
    deepArElement = <DeepARIOS />;
    
    const { permissionsGranted } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        
        <Button title="in app browser" onPress={ () => InAppBrowserWrapper.onLogin() }></Button>
        <Button title="switch camera" onPress={ () => this.switchCamera() }></Button>
        <Button title="switch effect" onPress={ () => this.onChangeEffect() }></Button>

        {/* <SectionedMultiSelect styles={{backgroundColor:"#ff0"}} 
         items={items} uniqueKey="id" IconRenderer={Icon}
          onSelectedItemsChange={this.selectItem}  /> */}

          {permissionsGranted ? 
          <View>{deepArElement}</View> : 
          <Text>permissions not granted</Text> }

        <FlatList 
          contentContainerStyle={{alignItems:'center',}} 
          keyExtractor={(item, index) => item.id+item.picUrl}
          horizontal={true} style={styles.flatlist} data={listData} renderItem={renderItem} />

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
];
// destructuring the object passed in... to rename use item:myItem.  how to type them though?
let renderItem = ({item, index, sep}) => {
  return (
  <View key={item.id} style={styles.flatlistItem}>
    <Text>{item.id}</Text>
    <Image source={{uri:item.picUrl, cache:"reload"}} style={{width:100,height:100}}   />
  </View>
  )
};

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  flatlist: {
    height: 100,
    flexDirection: 'row',
    backgroundColor: '#666',
    padding: 10,
    position: 'absolute',
    bottom: 10,
  },
  flatlistItem:{
    padding: 5,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333'//'moccasin',
  },
  deeparview: {
    flex: 1,
    width: 100,//width,
    height: 100,//'100%'
  }
});
