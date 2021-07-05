import PropTypes from "prop-types";
import React from "react";
import {
  findNodeHandle,
  requireNativeComponent, UIManager
} from "react-native";

export default class DeepARView extends React.Component {
  constructor(props){
    super(props);
    this.deeparref = React.createRef();
  }

  getDeepARViewHandle = () => findNodeHandle(this.deeparref.current);

  switchCamera = () => {
    UIManager.dispatchViewManagerCommand(
      this.getDeepARViewHandle(),
      UIManager.getViewManagerConfig('DeepARModule').Commands.switchCamera,
      null
    );
  }

  render() {
    var onEventSent = (event) => {
      const onEventSentCallback = this.props.onEventSent;
      console.log("RECEIVED message from native", event.nativeEvent, onEventSentCallback);

      if(onEventSentCallback) {
        onEventSentCallback(event.nativeEvent);
      }
    }

    let {...props} = {...this.props};
    delete props.onEventSent;

    return(
      <DeepARModule onEventSent={onEventSent} {...this.props} ref={this.deeparref} />
    )
  }
}

DeepARView.propTypes = {
  onEventSent: PropTypes.func,
};

const DeepARModule = requireNativeComponent('DeepARModule', DeepARView);