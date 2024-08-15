import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";
import MessagesStackNavigator from "./MessagesStackNavigator";
import FriendScreen from "../Screens/Main/FriendScreen";
import ProfileStackNavigator from "./ProfileStackNavigator";
import RoomStackNavigator from "./RoomStackNavigator";
import tabBarStyles from "../Components/tabBarStyles";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          let iconSize = 40;

          switch (route.name) {
            case "Tin nhắn":
              iconName = "chat";
              iconSize = 40;
              break;
            case "Phòng":
              iconName = "groups";
              iconSize = 40;
              break;
            case "Bạn bè":
              iconName = "person-add";
              iconSize = 40;
              break;
            case "Cá nhân":
              iconName = "person";
              iconSize = 40;
              break;
            default:
              iconName = "home";
              iconSize = 40;
              break;
          }

          return <Icon name={iconName} size={iconSize} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: "#A36658",
        tabBarInactiveTintColor: "white",
        tabBarStyle: tabBarStyles.tabBar, // Sử dụng style từ file tabBarStyles.js
        tabBarShowLabel: false, // Ẩn chữ dưới các tab
        tabBarLabel: () => null, // ẩn label
      })}
    >
      <Tab.Screen name="Tin nhắn" component={MessagesStackNavigator} />
      <Tab.Screen name="Phòng" component={RoomStackNavigator} />
      <Tab.Screen name="Bạn bè" component={FriendScreen} />
      <Tab.Screen name="Cá nhân" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}
