import {Text} from "react-native";
import {Button} from "react-native-paper";
import {styles} from '../styles';

const DebugButton = (props) => {
	// also can use Icon.Button
	return <Button
		style={[styles.button,props.style]} icon={props.iconName} mode='contained' compact={true} onPress={props.onPress} >
		<Text style={{fontSize: 11,fontWeight: 'bold'}}>{props.text}</Text>
	</Button>
};
