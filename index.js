import * as React from 'react';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { configureFonts, Provider as Paper } from 'react-native-paper';
import Feather from 'react-native-vector-icons/Feather';

const theme = {
    dark: false,
    roundness: 4,
    colors: {
        // most frequent 
        primary: '#ccf',
        secondary: '#66f',
        accent: '#03dac4',
        background: '#f0f0e6',
        // drop down bg
        surface: '#caf',
        error: '#B00020',
        onPrimary: '#ccf7',
        onSurface: '#ffa',
        text: '#444',
        // alerts
        disabled: '#777',
        placeholder: '#777',
        backdrop: '#8f8',
        notification: '#ca5',
    },
    fonts: configureFonts(),
    animation: {
        scale: 1.0,
    },
};

export default function Main() {
    return (
        <Paper 
            settings={{icon: props => <Feather {...props}/>}} 
            theme={theme}>
            <App />
        </Paper>
    );
}

AppRegistry.registerComponent(appName, () => Main);
