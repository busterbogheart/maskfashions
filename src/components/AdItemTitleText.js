import React,{Component} from "react";
import {Dimensions, Text, View} from "react-native";

export default class AdItemTitleText extends Component {
	constructor(props) {
		super(props);

		this.screenWidth = Dimensions.get('window').width;

		this.state = {
		}
	}

	render = () => {
		const {currentAdItem: ad} = this.props;
		if (ad && ad.name) {
		  const allText = {
			color: '#ffffff88',textShadowColor: '#000',textShadowOffset: {width: 1,height: 1},
			textAlign: 'center',fontWeight: 'bold'
		  };
		  return (
			<View style={{
			  position: 'absolute',bottom: 5,width: this.screenWidth,
			}}>
			  <Text style={[{fontSize: 24},allText]}>{ad.name}</Text>
			  <Text style={[{},allText]}>by</Text>
			  <Text style={[{},allText]}>{ad.advertiser}</Text></View>
		  );
		} else {
		  return <></>;
		}
	}
}