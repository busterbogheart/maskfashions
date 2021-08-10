import React from "react"
import { Dimensions, Text, View } from "react-native";
import { Appbar, useTheme } from "react-native-paper";

const BeltNav = (props) => {
    const theme = useTheme();
    const screenWidth = Dimensions.get('window').width;
    const iconSize = 30;
    const app = props.app;

    const IconNav = (props) => {
        return (
            <View style={{top:4, flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                <Appbar.Action style={{padding:0,margin:0,}} size={iconSize} icon={props.icon} onPress={props.onPress}></Appbar.Action>
                <Text style={{top:-8, fontSize:11, fontWeight:'bold', textTransform:'uppercase',padding:0,margin:0}}>{props.title}</Text>
            </View>
        )
    };

    return (
        <View style={{alignItems:'center', borderBottomWidth:1, borderBottomColor:'#555', 
        flexDirection:'row', justifyContent:'space-evenly', width: screenWidth, height: 52, backgroundColor: theme.colors.primary }}>
            <IconNav title='random' icon='dice-3' onPress={()=>{}} />
            <IconNav title='add' icon='heart-plus' onPress={app.addToFavorites} />
            <IconNav title='shoot' icon='camera' onPress={app.takeScreenshot} />
            <IconNav title='clip' icon='video' onPress={()=>{}} />
            <IconNav title='buy' icon='gift' onPress={app.showDialog} />

            {/* <Appbar.Action size={iconSize} icon='folder-heart' onPress={app.checkFavorites}/> */}
        </View>
    );
}

export default BeltNav;