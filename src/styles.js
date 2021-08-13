import { Dimensions, Platform, StyleSheet } from "react-native";
import { configureFonts, useTheme } from "react-native-paper";


const screenWidth = Dimensions.get('window').width;

const theme = {
  dark: false,
  roundness: 3,
  colors: {
      // most frequent, belt nav 
      primary: '#ccf',
      // bottom nav
      secondary: '#eee',
      accent: '#03dac4',
      background: '#cdd',
      // drop down bg
      surface: '#000',
      error: '#B00020',
      onPrimary: '#ccf7ff',
      // snackbar bg color
      onSurface: '#de3',
      text: '#333',
      // bottom nav
      textSecondary: '#888',
      disabled: '#77700c',
      placeholder: '#777fff',
      // modal bg color
      backdrop: '#cdc',
      // snackbar text
      notification: '#000',
  },
  fonts: configureFonts(),
  animation: {
      scale: 1.0,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    // alignContent: 'flex-start', //cross axis with flexWrap on, overrides alignContent of parent
    // alignSelf: 'stretch', // overrides parent's alignItems
    justifyContent: 'space-between',   // children along main axis
    alignItems: 'flex-start', // children along cross axis.  for stretch to work, children must not be fixed in cross axis
    backgroundColor: theme.colors.background,  
  },
  deepar : {
    width: screenWidth, 
    flex:1,
  },
  deeparContainer:{
    flexBasis: 200,
    flexGrow: 1,
  },
  buttonContainer:{
    flex:1,
    // flexWrap: 'wrap',  //set on container,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    top: Platform.OS == 'ios' ? 80 : 65,
    position: 'absolute',
    width: screenWidth,
  },
  button: {
    width: 105,
    height: 30,
    padding: 0,
    margin: 5,
    alignItems:'flex-start'
  },
  maskScroll: (maskSize='') => ({
    flexBasis: maskSize - 70,
    flexDirection: 'row',
  }),
  maskScrollItem: (maskSize='') => ({
    height: maskSize,
    width: maskSize,
  }),
  appbar: {
    flexBasis: 48,
    justifyContent: 'space-around',
    width: screenWidth,
  }
});

export {styles, theme};