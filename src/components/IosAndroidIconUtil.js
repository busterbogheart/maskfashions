import React from "react";
import {Platform,Text} from "react-native";
import {createIconSet} from "react-native-vector-icons";

export default class IosAndroidIconUtil {
    static IosIcons = null;
    static glyphs = {
        'ios-share': '',
        'ios-bug': '',
        'ios-heart': '',
        'camera-reverse': '',
    };

    static byPlatform = (iosIconName = null,androidIconName = null) => {
        if (!IosAndroidIconUtil.IosIcons) {
            IosAndroidIconUtil.IosIcons = createIconSet(IosAndroidIconUtil.glyphs,'Ionicons','Ionicons.ttf');
        }

        const iosComponent = ({size,color}) => <IosAndroidIconUtil.IosIcons size={size} color={color} name={iosIconName} />;

        if (Platform.OS === 'android' && androidIconName) {
            return androidIconName;
        } else if (Platform.OS === 'ios' && iosIconName){
            return iosComponent;
        } else {
            // only one specified, use for both
            return iosIconName == null ? androidIconName : iosComponent;
        }
    };

}