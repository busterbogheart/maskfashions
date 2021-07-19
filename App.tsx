"use strict";

import React from 'react';
import { StyleSheet, Text, View, Button, PermissionsAndroid, Dimensions, Platform, AppState, SafeAreaView, FlatList, Image } from 'react-native';
import DeepARView from './src/DeepARView';
import DeepARViewiOS from './src/MapModule';
import { AdItem,CampaignAssignment } from './src/AdsApiMapping';

class AdItemTest{
  name: string;
  id: number;
  readonly something!: object;

  constructor(name:string, id:number){
    this.name = name;
    this.id = id;
  }
}

export default class App extends React.Component<any, any> {

  constructor(props:object) {
    super(props);

    this.state = {
      permissionsGranted: Platform.OS === 'ios',
      switchCameraInProgress: false,
      displayText: '',
      currentEffectIndex: 0
    }
  }

  didAppear() {
    if (this.deepARView) {
      this.deepARView.resume();
    }
  }

  willDisappear(){
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
    deepArElement = <DeepARView style={styles.deeparview} onEventSent={this.onEventSent} ref={ ref => this.deepARView = ref }/>
    else if (Platform.OS === 'ios')
    deepArElement = <DeepARViewiOS />;
    
    const { permissionsGranted } = this.state;

    return (
      <View style={styles.container}>
          {permissionsGranted ? <View>{deepArElement}</View> : <Text>permissions not granted</Text> }
        <Text>{this.state.displayText}</Text>
        <Button title="Load Effect" onPress={ () => this.onChangeEffect() }></Button>

        <FlatList 
          contentContainerStyle={{alignItems:'center',}} 
          horizontal={true} style={styles.flatlist} data={listData} renderItem={renderItem} />

      </View>
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
    height: 200,
    flexDirection: 'row',
    backgroundColor: '#666',
    padding: 20,
    position: 'absolute',
    bottom: 50,
  },
  flatlistItem:{
    padding: 10,
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
