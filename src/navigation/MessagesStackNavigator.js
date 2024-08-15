import React from 'react'
import ChatWindow from '../Screens/Main/ChatWindow';
import MessagesScreen from '../Screens/Main/MessagesScreen';
import { createStackNavigator } from '@react-navigation/stack';
import { TransitionPresets } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function MessagesStackNavigator() {
  return (
    <Stack.Navigator
          initialRouteName="MessagesScreen"
          screenOptions={{
          ...TransitionPresets.SlideFromRightIOS, // hiệu ứng chuyển trang
          }}
        >
        <Stack.Screen name="MessagesScreen" component={MessagesScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChatWindow" component={ChatWindow}  />
    </Stack.Navigator>
  )
}