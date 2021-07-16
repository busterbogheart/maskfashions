"use strict";

import React from 'react';
import { StyleSheet, Text, View, Button, PermissionsAndroid, Dimensions, Platform, AppState } from 'react-native';
import DeepARView from './src/DeepARView';
import { AdItem } from './src/AdsApiMapping';
import { isPast,isFuture,parseJSON } from 'date-fns';
import MapModule from './src/MapModule';

export default class App extends React.Component<any, any> {
  
  private deeparview = React.createRef();

  constructor(props:object) {
    super(props);
    
    this.state = {
      permissionsGranted: Platform.OS === 'ios',
      switchCameraInProgress: false,
      displayText: '',
      currentEffectIndex: 0
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
            />
          </View>
          :
          <Text>permissions not granted</Text>
        }
        <Text>{this.state.displayText}</Text>
        <Button title="Load Effect" onPress={()=>{return true;}}></Button>
        <MapModule />

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
