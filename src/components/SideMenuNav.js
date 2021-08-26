import React from "react"
import {Dimensions,Linking,Platform,ScrollView,Text,TouchableOpacity,View} from "react-native";
import {Appbar} from "react-native-paper";
import {createIconSet} from "react-native-vector-icons";
import Share from 'react-native-share';
import {theme} from '../styles';

const SideMenuNav = ({app, sideMenuData}) => {
    const {width: screenWidth,height: screenHeight} = Dimensions.get('window');
    const iconSize = 34;
    const glyphmap = {
        'ios-share': '',
        'ios-bug': '',
        'ios-heart': '',
    };
    const IosIcons = createIconSet(glyphmap,'Ionicons','Ionicons.ttf');
    const iconByPlatform = (iosIconName,androidIconName) => {
        if (Platform.OS == 'android') return androidIconName;
        else return ({size,color}) => <IosIcons size={size} color={color} name={iosIconName} />
    };

    const IconNav = (props) => {
        return (
            <TouchableOpacity style={{padding:8}} onPressIn={props.onPress} delayPressIn={0} >
                <View style={{top: 0,flexDirection: 'column',justifyContent: 'center',alignItems: 'center'}}>
                    <Appbar.Action color={theme.colors.textSecondary} style={{padding: 0,margin: 0,top: 0}} size={iconSize} icon={props.icon} />
                    <Text style={{textAlign: 'center',color: theme.colors.textSecondary,top: 0,fontSize: 12,textTransform: 'uppercase',fontWeight: 'bold'}}>{props.title}</Text>
                </View>
            </TouchableOpacity>
        )
    };

    return (<>
        {sideMenuData ?
            <View style={{padding:20, flex: 1, backgroundColor: theme.colors.background}}>
                {sideMenuData}
            </View>
            :
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
        }
    </>)
}

export default SideMenuNav;