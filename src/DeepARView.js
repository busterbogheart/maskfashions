import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  StyleSheet,
  TouchableOpacity,
  requireNativeComponent,
} from "react-native";

export default class DeepARView extends React.Component {

  render() {
    return(
      <DeepARModule />
    )
  }
}

const DeepARModule = requireNativeComponent('DeepARModule',DeepARView);

const styles = StyleSheet.create({
  container : {
    backgroundColor: "transparent"
  }
});