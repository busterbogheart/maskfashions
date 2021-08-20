import React from "react"
import {Dimensions,Linking,Platform,ScrollView,Text,TouchableOpacity,View} from "react-native";
import {Appbar,useTheme} from "react-native-paper";
import {createIconSet} from "react-native-vector-icons";
import Share from 'react-native-share';
import DeviceInfo from 'react-native-device-info';
import shimAllSettled from "promise.allsettled/shim";

const SideMenuContent = ({app,content}) => {
    const theme = useTheme();
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
            <TouchableOpacity activeOpacity={.2} style={{padding:8}} onPress={props.onPress} >
                <View style={{top: 0,flexDirection: 'column',justifyContent: 'center',alignItems: 'center'}}>
                    <Appbar.Action color={theme.colors.textSecondary} style={{padding: 0,margin: 0,top: 0}} size={iconSize} icon={props.icon} />
                    <Text style={{textAlign: 'center',color: theme.colors.textSecondary,top: 0,fontSize: 12,textTransform: 'uppercase',fontWeight: 'bold'}}>{props.title}</Text>
                </View>
            </TouchableOpacity>
        )
    };

    const emailMe = async () => {
        const email = 'mailto:hello@maskfashions.app'
        shimAllSettled();
        Promise.allSettled([
            DeviceInfo.getBaseOs(),
            DeviceInfo.getApiLevel(),
            DeviceInfo.getBrand(),
            DeviceInfo.getUniqueId(),
            DeviceInfo.getCodename(),
            DeviceInfo.getDeviceId(),
            DeviceInfo.getLastUpdateTime(),
        ])
            .then(results => {
                let debugData = '';
                results.forEach(res => {
                    if (res.status == 'fulfilled') {
                        debugData += `${res.value},`;
                    }
                })
                Linking.openURL(`${email}?subject=Mask Fashions bug report&body=\n\n\n*Please include the following in your message* \n${debugData}`);
            });

    }

    return (<>
        {content ?
            <View style={{flex: 1,backgroundColor: theme.colors.background}}>
                {content}
            </View>
            :
            <View style={{

                flex: 1,alignItems: 'center',flexDirection: 'column',justifyContent: 'space-evenly',
                padding: 40,backgroundColor: theme.colors.background
            }}>
                <IconNav title='favorites' icon={iconByPlatform('ios-heart','folder-heart')} onPress={app.checkFavorites} />
                <IconNav title='share app' onPress={app.shareApp} icon={iconByPlatform('ios-share','share-variant')} />
                <IconNav title='report bug' onPress={emailMe} icon={iconByPlatform('ios-bug','spider-thread')} />
                <IconNav title='suggest feature' icon='bullhorn' onPress={() => {}} />
                <IconNav title='app info' icon='information' onPress={app.showAppInfo} />
            </View>
        }
    </>)
}

export default SideMenuContent;