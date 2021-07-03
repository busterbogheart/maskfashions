import React from 'react';
import { AppRegistry,StyleSheet,Text,View,Button, PermissionsAndroid, Dimensions} from 'react-native';
import DeepARView from './src/DeepARView';

export default class App extends React.Component {

  constructor(props){
    super(props)

    this.state = {
      permissionsGranted: Platform.OS === 'ios',
      currentEffectIndex: 0,
      switchCameraInProgress: false
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

  render(){
    const { permissionsGranted } = this.state
    const { width } = Dimensions.get('window')
    return (
      <View style={styles.container}>
      { permissionsGranted ? 
        <View>
          <DeepARView 
            style={{width: width, height: '100%'}}
            ref={ ref => this.deepARView = ref }
          />
          <Text>^ DeepAR should be above ^</Text>
        </View>
      : 
      <Text>permissions not granted</Text>
      }
        <Text>text here.</Text>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

});

