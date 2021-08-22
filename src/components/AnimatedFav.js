import React,{Component} from "react";
import {Animated, Easing} from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../styles';

export default class AnimatedFav extends Component {
	constructor(props) {
		super(props);

		this.state = {
			pos: new Animated.ValueXY({x: 0,y: -40}),
			opacity: new Animated.Value(0),
			finished: false,
		}
	}

	componentDidMount = () => {
		const {destX,destY} = this.props;
		Animated.parallel([
			Animated.timing(this.state.pos.x,{toValue:destX, easing:Easing.bounce, duration:1500, delay:200, useNativeDriver:true}),
			Animated.timing(this.state.pos.y,{toValue: destY,duration: 1400,useNativeDriver: true}),
			Animated.timing(this.state.opacity,{toValue: 1,duration: 1400,useNativeDriver: true}),
		]).start(({finished}) => {
			this.setState({finished: true})
		});
	}

	render() {
		const {style} = this.props;
		if (this.state.finished) return null;
		return (
			<Animated.View style={[style, {
				transform: [{translateX: this.state.pos.x},{translateY: this.state.pos.y}], opacity: this.state.opacity,
				justifyContent:'center', alignItems:'center', alignContent:'center',alignSelf:'center', flex:1
			}]}>
				<Icon style={{textAlign:'center'}} name='heart' size={34} color={theme.colors.accent} />
			</Animated.View>
		)
	}


}