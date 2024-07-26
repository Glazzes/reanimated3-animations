import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import PalleteExtractor from "./src";

export default function App() {
  return (
    <View style={styles.container}>
      <PalleteExtractor />
      <StatusBar style="dark" translucent={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
