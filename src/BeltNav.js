import React from "react"
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { Appbar, useTheme } from "react-native-paper";

const BeltNav = (props) => {
    const theme = useTheme();
    const screenWidth = Dimensions.get('window').width;
    const iconSize = 32;
    const navHeight = 56;
    const app = props.app;

    const IconNav = (props) => {
        return (
            <TouchableOpacity onPress={props.onPress} >
                <View style={{top:0, flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                    <Appbar.Action color={theme.colors.text} style={{padding:0,margin:0,}} size={iconSize} icon={props.icon} ></Appbar.Action>
                    <Text style={{color:theme.colors.text, top:-9, fontSize:11, fontWeight:'bold', textTransform:'uppercase',padding:0,margin:0}}>{props.title}</Text>
                </View>
            </TouchableOpacity>
        )
    };

    return (
        <View style={{alignItems:'center', borderBottomWidth:1, borderBottomColor:'#000', 
        flexDirection:'row', justifyContent:'space-around', width: screenWidth, 
        height: navHeight, backgroundColor: theme.colors.primary }}>
            <IconNav title='random' icon='dice-3' onPress={app.switchToRandomTexture} />
            <IconNav title='fav' icon='heart-plus' onPress={app.addToFavorites} />
            <IconNav title='shoot' icon='camera' onPress={app.takeScreenshot} />
            <IconNav title='clip' icon='video' onPress={()=>{}} />
            <IconNav title='buy mask' icon='gift' onPress={app.showNativeDialog} />

            {/* <Appbar.Action size={iconSize} icon='folder-heart' onPress={app.checkFavorites}/> */}
        </View>
    );
}

export default BeltNav;