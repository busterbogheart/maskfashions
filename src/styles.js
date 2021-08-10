import { Dimensions, Platform, StyleSheet } from "react-native";
import { configureFonts } from "react-native-paper";


const screenWidth = Dimensions.get('window').width;

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    // alignContent: 'flex-start', //cross axis with flexWrap on, overrides alignContent of parent
    // alignSelf: 'stretch', // overrides parent's alignItems
    justifyContent: 'flex-start',   // children along main axis
    alignItems: 'flex-start', // children along cross axis.  for stretch to work, children must not be fixed in cross axis
    backgroundColor: '#fdd',  
  },
  deepar : {
    ...Platform.select({
      android: {
        width: screenWidth, height:420
      },
      ios: {
        width: screenWidth, height: 350
      },
    })
  },
  buttonContainer:{
    flex:1,
    // flexWrap: 'wrap',  //set on container,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    top: Platform.OS == 'ios' ? 20 : 5,
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
    height: maskSize - 10,
    flexDirection: 'row',
  }),
  maskScrollItem: (maskSize='') => ({
    marginHorizontal: 8,
    marginBottom: 25,
    height: maskSize,
    width: maskSize,
  }),
  appbar: {
    height: 40,
    justifyContent: 'space-around',
    width: screenWidth,
  }
});

export {styles, theme};