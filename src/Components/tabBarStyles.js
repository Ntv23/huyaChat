
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 10, // Khoảng cách từ đáy màn hình
    left: 10,
    right: 10,
    elevation: 6,
    backgroundColor: '#89190D',
    borderRadius: 20,
    height: 70,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderTopWidth: 0,
    overflow: 'hidden',
    paddingBottom: 10,
  },
  // tabBarLabel: {
  //   fontSize: 15,
  // },
  tabBarItem: {
    padding: 5,
    alignItems: 'center'
  },
});
