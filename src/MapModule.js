import React, { Component } from "react";
import { requireNativeComponent } from "react-native";
import { View } from "react-native";

const RNTMapComponent = requireNativeComponent('RNTMap', RNTMapView, {});

export default class RNTMapView extends React.Component{
    render(){
        return <RNTMapComponent style={{flex:1}} />
    }
}