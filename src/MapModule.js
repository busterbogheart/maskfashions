import React, { Component } from "react";
import { Dimensions, requireNativeComponent, View } from "react-native";

const DeepARViewiOS = requireNativeComponent('DeepAR', RNTMapView, {});

export default class RNTMapView extends React.Component{
    render(){
        const {width} = Dimensions.get('window');
        return (
        <View style={{backgroundColor:"#000", width:width, flex:1}}>
            <DeepARViewiOS style={{flex:1}} />
        </View>
        )
    }
}