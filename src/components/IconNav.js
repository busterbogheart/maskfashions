import React from "react"
import {Appbar} from 'react-native-paper';
import { Text, TouchableOpacity, View } from "react-native";
import {theme} from '../styles';

export default IconNav = (props) => {
    const iconSize = 34;
	const {onPress,icon,title,color,style} = props;

	return (
		<TouchableOpacity style={[{padding: 8}, style]} onPressIn={onPress} delayPressIn={0} >
			<View style={{top: 0,flexDirection: 'column',justifyContent: 'center',alignItems: 'center'}}>
				<Appbar.Action color={color || theme.colors.textSecondary} style={{padding: 0,margin: 0,top: 0}} size={iconSize} icon={icon} />
				<Text style={{textAlign: 'center',color: color || theme.colors.textSecondary,top: 0,fontSize: 12,textTransform: 'uppercase',fontWeight: 'bold'}}>{title}</Text>
			</View>
		</TouchableOpacity>
	)
};
