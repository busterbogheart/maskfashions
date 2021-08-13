import React from "react"
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { Appbar, useTheme } from "react-native-paper";

const BeltNav = (props) => {
    const theme = useTheme();
    const screenWidth = Dimensions.get('window').width;
    const iconSize = 34;
    const navHeight = 56;
    const app = props.app;

    const IconNav = (props) => {
        return (
            <TouchableOpacity onPress={props.onPress} >
                <View style={{top:0, flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                    <Appbar.Action color={theme.colors.text} style={{padding:0,margin:0,top: props.iconTop || 0}} size={props.iconSize || iconSize} icon={props.icon} />
                    <Text style={{color:theme.colors.text, top: props.textTop || -9, fontSize:11, fontWeight:'bold', textTransform:'uppercase',padding:0,margin:0}}>{props.title}</Text>
                </View>
            </TouchableOpacity>
        )
    };

    return (
        <View style={{alignItems:'center', borderBottomWidth:1, borderBottomColor:'#000', 
        flexDirection:'row', justifyContent:'space-evenly', width: screenWidth, 
        height: navHeight, backgroundColor: theme.colors.primary }}>
            <IconNav title='random' icon='dice-3' onPress={app.switchToRandomTexture} />
            <IconNav title='save' icon='heart-plus' onPress={app.addToFavorites} />
            <IconNav title='' 
                icon='camera' iconSize={48} iconTop={8} 
            onPress={app.takeScreenshot} />
            <IconNav title='vid' icon='video' onPress={()=>{}} />
            <IconNav title='buy mask' 
                // icon='gift' 
                icon='cart'
                // icon='rocket-launch'
                // icon='open-in-new'
            onPress={app.showNativeDialog} />


        </View>
    );
}

export default BeltNav;