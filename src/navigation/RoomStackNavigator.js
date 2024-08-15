import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import RoomScreen from "../Screens/Room/RoomScreen";
import RoomList from "../Screens/Room/RoomList";
import RoomDetail from "../Screens/Room/RoomDetail";
import CommunityChat from "../Screens/Room/CommunityChat";
import { TransitionPresets } from "@react-navigation/stack";

const Stack = createStackNavigator();

export default function RoomStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS, // Thay đổi hiệu ứng chuyển đổi
      }}
    >
      <Stack.Screen
        name="RoomScreen"
        component={RoomScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RoomList"
        component={RoomList}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="RoomDetail" component={RoomDetail} />
      <Stack.Screen name="CommunityChat" component={CommunityChat} />
    </Stack.Navigator>
  );
}
