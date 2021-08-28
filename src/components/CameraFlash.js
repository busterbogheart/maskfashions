import React,{Component} from "react";
import {Animated} from "react-native";
import {theme, styles} from '../styles';

export default class CameraFlash extends Component {
	constructor(props) {
		super(props);

		this.state = {
			opacity: new Animated.Value(0),
		}
	}

	flash = () => {
		Animated.sequence([
			Animated.timing(this.state.opacity, {toValue: .6, duration: 20, useNativeDriver:true}),
			Animated.timing(this.state.opacity, {toValue: 0, duration: 100, useNativeDriver:true}),
		]).start();
	}

	render() {
		const {style} = this.props;
		return (
			<Animated.View style={[style, {
				opacity: this.state.opacity, flex: 1, backgroundColor: '#fff'
			}]}>
			</Animated.View>
		)
	}


}