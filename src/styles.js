import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get('window').width;
export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    // alignContent: 'flex-start', //cross axis with flexWrap on, overrides alignContent of parent
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
    flex: 1,
    flexWrap: 'wrap',  //set on container,
    flexDirection: 'column',
    justifyContent: 'center',
    // alignSelf: 'stretch', // overrides parent's alignItems
  },
  button: {
    width: 120,
    height: 34,
    paddingVertical: 0,
    margin: 3,
    alignItems: 'flex-start',
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
