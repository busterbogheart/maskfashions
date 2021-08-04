import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get('window');
export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    // alignContent: 'flex-end', //cross axis with flexWrap on, overrides alignContent of parent
    justifyContent: 'flex-end',   // main axis
    alignItems: 'center', // cross axis
    backgroundColor: '#a3e3eb',
  },
  buttonContainer:{
    flex: 1,
    flexWrap: 'wrap',  //set on container,
    flexDirection: 'column',
    justifyContent: 'center',
    // alignSelf: 'stretch', // overrides parent's alignItems
  },
  button: {
    width: 140,
    height: 34,
    paddingVertical: 0,
    margin: 3,
    alignItems: 'flex-start',
  },
  flatlist: (maskSize='') => ({
    height: maskSize - 10,
    flexDirection: 'row',
  }),
  flatlistItem: (maskSize='') => ({
    marginHorizontal: 8,
    marginBottom: 25,
    height: maskSize,
    width: maskSize,
  }),
  appbar: {
    // left:0, right:0, bottom:0, position:'absolute',
    height: 60,
    justifyContent: 'space-around',
    width: width,
  }
});
