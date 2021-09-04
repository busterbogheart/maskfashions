import React from "react"
import {View} from "react-native";
import {theme} from '../styles';
import IconNav from '../components/IconNav';
import IosAndroidIconUtil from "./IosAndroidIconUtil";

const SideMenuNav = ({app,sideMenuData}) => {
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
                <IconNav title='favorites' icon={IosAndroidIconUtil.byPlatform('ios-heart','folder-heart')} onPress={app.checkFavorites} />
                <IconNav title='share app' onPress={app.shareApp} icon={IosAndroidIconUtil.byPlatform('ios-share','share-variant')} />
                <IconNav title='report bug' onPress={app.reportBugEmail} icon={IosAndroidIconUtil.byPlatform('ios-bug','spider-thread')} />
                <IconNav title='suggest feature' icon='bullhorn' onPress={app.suggestFeatureEmail} />
                <IconNav title='app info' icon='information' onPress={app.showAppInfo} />
            </View>
        )
    }
}

export default SideMenuNav;