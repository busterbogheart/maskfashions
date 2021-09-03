import React from "react"
import {Platform,View} from "react-native";
import {theme} from '../styles';
import IconNav from '../components/IconNav';
import {createIconSet} from "react-native-vector-icons";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SideMenuNav = ({app,sideMenuData}) => {
    let glyphmap = {
        'ios-share': '',
        'ios-bug': '',
        'ios-heart': '',
    };
    IosIcons = createIconSet(glyphmap,'Ionicons','Ionicons.ttf');

    iconByPlatform = (iosIconName,androidIconName) => {
        if (Platform.OS == 'android') return androidIconName;
        else return ({size,color}) => <IosIcons size={size} color={color} name={iosIconName} />
    };

    if (sideMenuData) {
        return (
            <>
                <View key='menuback'><IconNav title='back' icon='arrow-left-thick' onPress={app.showSideMenu} /></View>
                <View key='menudata' style={{padding: 20,flex: 1,backgroundColor: theme.colors.background}}>
                    {sideMenuData}
                </View>
            </>
        )
    } else {
        return (
            <View style={{
                flex: 1,alignItems: 'center',flexDirection: 'column',justifyContent: 'space-evenly',
                padding: 20,backgroundColor: theme.colors.background
            }}>
                <IconNav title='favorites' icon={iconByPlatform('ios-heart','folder-heart')} onPress={app.checkFavorites} />
                <IconNav title='share app' onPress={app.shareApp} icon={iconByPlatform('ios-share','share-variant')} />
                <IconNav title='report bug' onPress={app.reportBugEmail} icon={iconByPlatform('ios-bug','spider-thread')} />
                <IconNav title='suggest feature' icon='bullhorn' onPress={app.suggestFeatureEmail} />
                <IconNav title='app info' icon='information' onPress={app.showAppInfo} />
            </View>
        )
    }
}

export default SideMenuNav;