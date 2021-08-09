import React from "react"
import { Dimensions, View } from "react-native";
import { Appbar, useTheme } from "react-native-paper";

const BeltNav = (props) => {
    const theme = useTheme();
    const screenWidth = Dimensions.get('window').width;
    const iconSize = 28;
    const app = props.app;

    return (
        <View style={{alignItems:'center', borderBottomWidth:1, borderBottomColor:'#555', flexDirection:'row', justifyContent:'space-evenly', width: screenWidth, height: 45, backgroundColor: theme.colors.primary }}>

            <Appbar.Action size={iconSize} icon='dice-3' onPress={()=>{}}/>
            <Appbar.Action size={iconSize} icon='heart-plus' onPress={app.addToFavorites}/>
            <Appbar.Action size={iconSize} icon='camera' onPress={app.takeScreenshot}/>
            <Appbar.Action size={iconSize} icon='video' onPress={()=>{}}/>
            <Appbar.Action size={iconSize} icon='gift' onPress={()=>{}}/>

            {/* <Appbar.Action size={iconSize} icon='folder-heart' onPress={app.checkFavorites}/> */}
        </View>
    );
}

export default BeltNav;