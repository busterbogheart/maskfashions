import React from "react"
import {Linking, Text, TouchableOpacity, View } from "react-native";
import { Appbar } from "react-native-paper";
import {styles, theme} from '../styles';

const BeltNav = (props) => {
    const iconSize = 34;
    const app = props.app;

    const IconNav = (props) => {
        return (
            <TouchableOpacity onPress={props.onPress} activeOpacity={.3}  >
                <View style={{top:0, flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                    <Appbar.Action color={theme.colors.text} style={{padding:0,margin:0,top: props.iconTop || 0}} size={props.iconSize || iconSize} icon={props.icon} />
                    <Text style={{color:theme.colors.text, top: props.textTop || -9, fontSize:11, fontWeight:'bold', textTransform:'uppercase',padding:0,margin:0}}>{props.title}</Text>
                </View>
            </TouchableOpacity>
        )
    };

    return (
        <View style={styles.beltNav}>
            <IconNav title='random' icon='dice-3' onPress={app.switchToRandomAdItem} />
            <IconNav title='save' icon='heart-plus' onPress={app.addToFavorites}  />
            <IconNav title='' icon='camera' iconSize={58} iconTop={8} onPress={app.takePhoto} />
            {/*<IconNav title='vid' icon='video' onPress={()=>{}} />*/}
            <IconNav title='buy mask' 
                //icon='cart'
                // icon='rocket-launch'
                 icon='open-in-new'
            onPress={app.buyButtonClicked} />
        </View>
    );
}

export default BeltNav;