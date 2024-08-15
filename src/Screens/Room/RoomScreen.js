import React from 'react'
import RoomList from '../Room/RoomList';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function RoomScreen ()  {
  return (
    <SafeAreaView style={styles.container}>
      <RoomList />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },

 })