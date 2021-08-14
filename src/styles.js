import { Dimensions, Platform, StyleSheet } from "react-native";
import { configureFonts, useTheme } from "react-native-paper";


const {width:screenWidth, height:screenHeight} = Dimensions.get('window');

const theme = {
  dark: false,
  roundness: 3,
  colors: {
      // most frequent, belt nav 
      primary: '#ccf',
      // bottom nav
      secondary: '#eaeaef',
      accent: '#aef',
      background: '#def',
      // drop down bg
      surface: '#000',
      // also used for cancel actions, 'clear'
      error: '#b44',
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
    backgroundColor: theme.colors.background,
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
    backgroundColor: theme.colors.background,
  }),
  maskScrollItem: (maskSize='') => ({
    height: maskSize,
    width: maskSize,
  }),
  filtersContainer:{
    flexBasis: 38,
    width: screenWidth,
    backgroundColor: theme.colors.background,
  },
  filterButtons:{
    flex:1,
    backgroundColor: theme.colors.secondary,
    flexDirection:'row',
    justifyContent: 'center',
    alignItems:'center',
  },
  filterButtonsClear: {
    paddingRight: 15,
  },
  filterButtonsFilter: {
    flex:1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  beltNav: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: screenWidth,
    height: 56,
    backgroundColor: theme.colors.primary
  },
  appbar: {
    flexBasis: 38,
    justifyContent: 'space-around',
    width: screenWidth,
  },
});

const filterModalStyles = StyleSheet.create({
  // modal bg
  container: {
  },
  scrollView:{
    // backgroundColor:theme.colors.background
  },
  // also covers the screen
  backdrop: {
  },
  // covers the screen
  modalWrapper: {
  },
  listContainer: {
  },
});

export {styles, theme, filterModalStyles};