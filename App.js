import React from 'react';
import { AppRegistry,StyleSheet,Text,View,Button, PermissionsAndroid, Dimensions} from 'react-native';
import DeepARView from './src/DeepARView';

class AdItem {
  name;
  created_date;
  creative_url;
  id;

  constructor(data){
    Object.assign(this, data);
  }
}



export default class App extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      permissionsGranted: Platform.OS === 'ios',
      switchCameraInProgress: false,
      displayText:''
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

    // TODO: wrap these up and get classes mapped per endpoint and per params
    const expandAllParam = {expand:"all"};
    this.adsAPI('placements', expandAllParam)
      .then((response) => response.json())
      .then((json) => {
        console.log(JSON.stringify(json));
      });

    this.adsAPI('ad-items')
      .then((response) => response.json())
      .then((json) => {
        // console.log(json.data.length+" ad items fetched");
        for (const k in json.data){
          const e = new AdItem(json.data[k]);
        }
      })
      .catch((err) => console.warn(err));
  }

  async adsAPI (endpoint, data = {}) {
    const apiKey = 'da81d8cf585242c7818d43bdddcd0769';
    const params = new URLSearchParams(data);
    const url = "https://api.adbutler.com/v2/"+endpoint+"?"+params;
    let response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': 'Basic '+apiKey,
      },
    });
    return response;
  }

  didAppear() {
    console.info('didappear');
    if (this.deepARView) {
      this.deepARView.resume();
    }
  }

  willDisappear(){
    console.info('will disappear');
    if (this.deepARView) {
      this.deepARView.pause();
    }
  }

  componentWillUnmount(){
    console.info('component will unmount');
  }

  componentDidUpdate(){
    console.info('component did update');
  }

  switchCamera(){
    this.deepARView.switchCamera();
  }

  render(){
    console.info('render');
    const { permissionsGranted } = this.state
    return (
      <View style={styles.container}>
      { permissionsGranted ? 
        <View>
          <DeepARView 
            style= {styles.deeparview}
            ref={ ref => this.deepARView = ref }
          />
        </View>
      : 
      <Text>permissions not granted</Text>
      }
      <Text>{this.state.displayText}</Text>
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
  deeparview:{
    width: 100, /*width, */
    height: 100 /* '100%' */
  }
});
