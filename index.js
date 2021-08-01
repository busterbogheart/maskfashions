import * as React from 'react';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { configureFonts, Provider as Paper } from 'react-native-paper';
import color from 'color';

const theme = {
    dark: false,
    roundness: 4,
    colors: {
        primary: '#ccf',
        accent: '#03dac4',
        background: '#f6f6f6',
        surface: 'ghostwhite',
        error: '#B00020',
        text: 'rebeccapurple',
        onSurface: '#000000',
        disabled: color('#000').alpha(0.26).rgb().string(),
        placeholder: color('#000').alpha(0.54).rgb().string(),
        backdrop: color('#000').alpha(0.5).rgb().string(),
        notification: '#ca5',
    },
    fonts: configureFonts(),
    animation: {
        scale: 1.0,
    },
};

export default function Main() {
    return (
        <Paper theme={theme}><App /></Paper>
    );
}

AppRegistry.registerComponent(appName, () => Main);
