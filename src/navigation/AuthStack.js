
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Signin from '../Screens/Auth/Signin';
import Signup from '../Screens/Auth/Signup';
import ForgotPassword from '../Screens/Auth/ForgotPassword';
import { TransitionPresets } from '@react-navigation/stack';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false,
      ...TransitionPresets.SlideFromRightIOS, // hiệu ứng chuyển trang
     }}>
      <Stack.Screen name="Signin" component={Signin} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    </Stack.Navigator>
  )
}
