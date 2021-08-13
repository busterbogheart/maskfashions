import React from "react"
import { Dimensions, Platform, Text, TouchableOpacity, View } from "react-native";
import { Appbar, useTheme } from "react-native-paper";
import { createIconSet } from "react-native-vector-icons";

const BottomNav = (props) => {
    const theme = useTheme();
    const screenWidth = Dimensions.get('window').width;
    const iconSize = 22;
    const navHeight = 48;
    const app = props.app;
    const glyphmap = {
        'ios-share':'',
        'ios-bug':'',
        'ios-heart':'',
    };
    const IosIcons = createIconSet(glyphmap, 'Ionicons', 'Ionicons.ttf');
    const iconByPlatform = (iosIconName, androidIconName) => {
        if(Platform.OS == 'android') return androidIconName;
        else return ({size,color}) => <IosIcons size={size} color={color} name={iosIconName} />
    };


    const IconNav = (props) => {
        return (
            <TouchableOpacity onPress={props.onPress} >
                <View style={{top:0, flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                    <Appbar.Action color={theme.colors.textSecondary} style={{padding:0,margin:0,top: props.iconTop || 0}} size={props.iconSize || iconSize} icon={props.icon} />
                    <Text style={{color:theme.colors.textSecondary, top: props.textTop || -5, fontSize:10, textTransform:'uppercase', fontWeight:'bold'}}>{props.title}</Text>
                </View>
            </TouchableOpacity>
        )
    };

    return (
        <View style={{alignItems:'center', flexDirection:'row', justifyContent:'space-evenly', width: screenWidth, 
        height: navHeight, backgroundColor: theme.colors.secondary }}>
            <IconNav title='favorites' icon={iconByPlatform('ios-heart','folder-heart')} onPress={ app.checkFavorites } />
            <IconNav title='share app' onPress={()=>{}} icon= {iconByPlatform('ios-share', 'share-variant')} />
            <IconNav title='report bug' onPress={()=>{}} icon= {iconByPlatform('ios-bug', 'spider-thread')} />
            {/* <IconNav title='suggest feature' icon='bullhorn' onPress={()=>{}} /> */}
            <IconNav title='app info' icon='information' onPress={()=>{}} />
        </View>
    );
}

export default BottomNav;