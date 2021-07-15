"use strict";

import React from 'react';
import { StyleSheet, Text, View, Button, PermissionsAndroid, Dimensions, Platform } from 'react-native';
import DeepARView from './src/DeepARView';
import { AdItem } from './src/AdsApiMapping';
import { isPast,isFuture,parseJSON } from 'date-fns';


export default class App extends React.Component {
  constructor(props:object) {
    super(props)

    this.state = {
      permissionsGranted: Platform.OS === 'ios',
      switchCameraInProgress: false,
      displayText: '',
      currentEffectIndex: 0
    }
  }
  
  didAppear = () => {
    console.info('didappear');
    if (this.deepARView) {
      this.deepARView.resume();
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
          result['android.permission.CAMERA'] === 'granted' &&
          result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted' &&
          result['android.permission.RECORD_AUDIO'] === 'granted') {
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

    const loadEffect = () => {
      if(this.deepARView){
        this.deepARView.switchEffect(effects[0].name, 'effect')
      }
    }
  }

  willDisappear() {
    console.info('will disappear');
    if (this.deepARView) {
      this.deepARView.pause();
    }
  }

  componentWillUnmount() {
    console.info('component will unmount');
  }

  componentDidUpdate() {
    console.info('component did update');
  }

  switchCamera() {
    this.deepARView.switchCamera();
  }

  render() {
    console.info('render');
    const { permissionsGranted } = this.state;
    return (
      <View style={styles.container}>
        {permissionsGranted ?
          <View>
            <DeepARView
              style={styles.deeparview}
              ref={ref => this.deepARView = ref}
            />
          </View>
          :
          <Text>permissions not granted</Text>
        }
        <Text>{this.state.displayText}</Text>
        <Button title="Load Effect" onPress={()=>{return true;}}></Button>

      </View>
    );
  }
}



const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'darksalmon',
  },
  deeparview: {
    width: 100, /*width, */
    height: 100 /* '100%' */
  }
});
