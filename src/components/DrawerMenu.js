import React from "react"
import {Dimensions,Linking,Platform,Share as RNShare,Text,TouchableOpacity,View} from "react-native";
import {Appbar,useTheme} from "react-native-paper";
import {createIconSet} from "react-native-vector-icons";
import Share from 'react-native-share';

const DrawerMenu = (props) => {
    const theme = useTheme();
    const {width: screenWidth,height: screenHeight} = Dimensions.get('window');
    const iconSize = 34;
    const app = props.app;
    const glyphmap = {
        'ios-share':'',
        'ios-bug':'',
        'ios-heart':'',
    };
    const IosIcons = createIconSet(glyphmap,'Ionicons','Ionicons.ttf');
    const iconByPlatform = (iosIconName,androidIconName) => {
        if (Platform.OS == 'android') return androidIconName;
        else return ({size,color}) => <IosIcons size={size} color={color} name={iosIconName} />
    };

    const IconNav = (props) => {
        return (
            <TouchableOpacity onPress={props.onPress} >
                <View style={{top: 0,flexDirection: 'column',justifyContent: 'center',alignItems: 'center'}}>
                    <Appbar.Action color={theme.colors.textSecondary} style={{padding: 0,margin: 0,top: 0}} size={iconSize} icon={props.icon} />
                    <Text style={{color: theme.colors.textSecondary,top: 0,fontSize: 12,textTransform: 'uppercase',fontWeight: 'bold'}}>{props.title}</Text>
                </View>
            </TouchableOpacity>
        )
    };

    const shareApp = async () => {
        const res = await RNShare.share({
            message: 'share the app: {$appurl}',
            url: 'http://maskfashions.app',
            title: 'Mask Fashions?'
        },{
            dialogTitle: 'title?',
            subject: 'Mask Fashions?'
        });

    }

    const emailMe = async () => {
        const email = 'mailto:hello@maskfashions.app'
        Linking.openURL(`${email}?subject=bug report`);
    }

    return (
        <View style={{
            flex: 1,alignItems: 'center',flexDirection: 'column',justifyContent: 'space-evenly',alignContent: 'flex-start',
            padding: 20,backgroundColor: '#333'
        }}>
            <IconNav title='favorites' icon={iconByPlatform('ios-heart','folder-heart')} onPress={app.checkFavorites} />
            <IconNav title='share app' onPress={shareApp} icon={iconByPlatform('ios-share','share-variant')} />
            <IconNav title='report bug' onPress={emailMe} icon={iconByPlatform('ios-bug','spider-thread')} />
            {/* <IconNav title='suggest feature' icon='bullhorn' onPress={()=>{}} /> */}
            <IconNav title='app info' icon='information' onPress={() => {}} />
        </View>
    )
}

export default DrawerMenu;