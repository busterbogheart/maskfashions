import React, { Component } from "react";
import { Dimensions, requireNativeComponent, View } from "react-native";

const DeepARViewiOS = requireNativeComponent('DeepAR', DeepARIOSView);

export default class DeepARIOSView extends React.Component{
    render(){
        const {width} = Dimensions.get('window');
        return (
            <DeepARViewiOS style={{ flex:1 }} />
        )
    }
}