import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function CustomHeader({ title }) {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  )
}
const styles = StyleSheet.create({
  headerContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: "#89190D",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderTopWidth: 0,
    elevation: 10,
    overflow: "hidden",
    zIndex: 1,
  },
  headerTitle: {
    justifyContent: "center",
    alignItems: "center",
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 25,
  },
});