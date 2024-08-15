
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './AuthStack';
import BottomTabNavigator from './BottomTabNavigator';
import { TransitionPresets } from '@react-navigation/stack';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false,
      ...TransitionPresets.SlideFromRightIOS, // hiệu ứng chuyển trang
     }}>
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="BottomTab" component={BottomTabNavigator} />
    </Stack.Navigator>
  )
}