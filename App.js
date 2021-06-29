import React from 'react';
import { AppRegistry,StyleSheet,Text,View,Button, PermissionsAndroid, Dimensions} from 'react-native';
import DeepARView from './src/DeepARView';

export default class App extends React.Component {

  render(){
    const { width } = Dimensions.get('window')
    return (
      <View style={styles.container}>
        <DeepARView style={{position: 'absolute', width: '100%', height: '100%'}} />
        <Button title="request" onPress={requestCameraPermission}></Button>
      </View>
    );
  }
}

const requestCameraPermission = async () => {
  PermissionsAndroid.requestMultiple(
    [
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    ]
  )
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },

});

