import * as React from 'react';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { configureFonts, Provider as Paper } from 'react-native-paper';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const theme = {
    dark: false,
    roundness: 3,
    colors: {
        // most frequent 
        primary: '#ccf',
        secondary: '#66f',
        accent: '#03dac4',
        background: '#4fc4fc',
        // drop down bg
        surface: '#caf',
        error: '#B00020',
        onPrimary: '#ccf7',
        // snackbar bg color
        onSurface: '#ffa',
        text: '#444',
        disabled: '#777',
        placeholder: '#777',
        // modal bg color
        backdrop: '#cdc',
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
            // settings={{icon: props => <Feather {...props}/>}} 
            settings={{icon: props => <MaterialCommunityIcons {...props}/>}} 
            theme={theme}>
            <App />
        </Paper>
    );
}

AppRegistry.registerComponent(appName, () => Main);
