import React from "react";
import ProfileScreen from "../Screens/Main/ProfileScreen";
import SettingScreen from "../Screens/Main/SettingScreen";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { TransitionPresets } from "@react-navigation/stack";

const Stack = createStackNavigator();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS, // hiệu ứng chuyển trang
      }}
    >
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SettingScreen"
        component={SettingScreen}
        options={{
          headerShown: true, // Hiển thị header cho SettingScreen
          headerStyle: {
            backgroundColor: "#891C00", // Màu nền của header
          },
          headerTintColor: "#fff", // Màu nút back và tiêu đề
          headerTitleAlign: "center", // Căn giữa tiêu đề
          headerBackTitleVisible: false, // Ẩn tiêu đề của nút back (tùy chọn)
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={24} color="#fff" />
          ),
          headerTitle: "Cài đặt",
        }}
      />
    </Stack.Navigator>
  )
}
