import PropTypes from "prop-types";
import React from "react";
import { Dimensions, findNodeHandle, requireNativeComponent,UIManager} from "react-native";
import {styles} from '../styles';

export default class DeepARModuleWrapper extends React.Component {
  constructor(props){
    super(props);
  }

  getDeepARViewHandle = () => findNodeHandle(this.refs.deepARView);

  switchCamera = () => {
    console.debug('deeparview switchcamera');
    UIManager.dispatchViewManagerCommand(
      this.getDeepARViewHandle(),
      UIManager.getViewManagerConfig('DeepARModule').Commands.switchCamera,
      null
    );
  }

  switchTexture = (URLorFilename, isRemote) => {
    console.debug(`switchtexture remote? ${isRemote}, ${URLorFilename}`);
    UIManager.dispatchViewManagerCommand(
      this.getDeepARViewHandle(),
      UIManager.getViewManagerConfig('DeepARModule').Commands.switchTexture,
      [URLorFilename, isRemote]
    );
  }

  switchEffect = (maskName, slot) => {
    console.debug('switcheffect deeparview');
    UIManager.dispatchViewManagerCommand(
      this.getDeepARViewHandle(),
      UIManager.getViewManagerConfig('DeepARModule').Commands.switchEffect,
      [maskName, slot]
    );
  }

  setFlashOn = flashOn => {
    console.debug('flashon deeparview');
    UIManager.dispatchViewManagerCommand(
      this.getDeepARViewHandle(),
      UIManager.getViewManagerConfig('DeepARModule').Commands.setFlashOn,
      [flashOn]
    );
  }

  pause() {
    console.debug('pause deeparview');
    UIManager.dispatchViewManagerCommand(
      this.getDeepARViewHandle(),
      UIManager.getViewManagerConfig('DeepARModule').Commands.pause,
      null
    );
  }

  resume() {
    console.debug('resume deeparview');
    UIManager.dispatchViewManagerCommand(
      this.getDeepARViewHandle(),
      UIManager.getViewManagerConfig('DeepARModule').Commands.resume,
      null
    );
  }

  takeScreenshot() {
    console.debug('takescreenshot deeparview');
    UIManager.dispatchViewManagerCommand(
      this.getDeepARViewHandle(),
      UIManager.getViewManagerConfig('DeepARModule').Commands.takeScreenshot,
      null
    );
  }

  startRecording() {
    console.debug('startrecording deeparview');
    UIManager.dispatchViewManagerCommand(
      this.getDeepARViewHandle(),
      UIManager.getViewManagerConfig('DeepARModule').Commands.startRecording,
      null
    );
  }

  finishRecording() {
    console.debug('finishrecording deeparview');
    UIManager.dispatchViewManagerCommand(
      this.getDeepARViewHandle(),
      UIManager.getViewManagerConfig('DeepARModule').Commands.finishRecording,
      null
    );
  }

  render() {
    console.debug('render deeparview');
    var onEventSent = (event) => {
      const onEventSentCallback = this.props.onEventSent;
      console.debug("RECEIVED message from native", event.nativeEvent, onEventSentCallback);

      if(onEventSentCallback) {
        onEventSentCallback(event.nativeEvent);
      }
    }

    let {...props} = {...this.props};
    delete props.onEventSent;

    const { width } = Dimensions.get('window');

    return(
      <DeepARModule 
        ref = "deepARView"
        {...this.props}  
        onEventSent={onEventSent} 
        style={styles.deepar} 
      />
    )
  }
}

DeepARModuleWrapper.propTypes = {
  onEventSent: PropTypes.func,
};

const DeepARModule = requireNativeComponent('DeepARModule', DeepARModuleWrapper);