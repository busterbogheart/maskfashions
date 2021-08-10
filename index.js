import * as React from 'react';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { Provider as Paper } from 'react-native-paper';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from './src/styles';

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
