import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  requireNativeComponent,
} from "react-native";

export default class DeepARView extends React.Component {
  constructor(props){
    super(props);
  }

  render() {
    return(
      <DeepARModule {...this.props} />
    )
  }
}

const DeepARModule = requireNativeComponent('DeepARModule', DeepARView);