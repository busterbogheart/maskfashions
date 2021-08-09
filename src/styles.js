import { Dimensions, Platform, StyleSheet } from "react-native";

const screenWidth = Dimensions.get('window').width;
export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    // alignContent: 'flex-start', //cross axis with flexWrap on, overrides alignContent of parent
    // alignSelf: 'stretch', // overrides parent's alignItems
    justifyContent: 'flex-start',   // children along main axis
    alignItems: 'flex-start', // children along cross axis.  for stretch to work, children must not be fixed in cross axis
    backgroundColor: '#dec',  
  },
  deepar : {
    ...Platform.select({
      android: {
        width: 250, height:350
      },
      ios: {
        width: screenWidth, height: 250
      },
    })
  },
  buttonContainer:{
    flex:1,
    flexWrap: 'wrap',  //set on container,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    top: Platform.OS == 'ios' ? 20 : 0,
    position: 'absolute',
    width: screenWidth,
  },
  button: {
    width: 105,
    height: 30,
    paddingVertical: 0,
    margin: 5,
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
