import React from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";

import { StickerProvider, BottomSheetProvider } from "@providers/index";
import { MainScreen } from "./src/main-screen";

const App = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <StickerProvider>
        <BottomSheetProvider>
          <MainScreen />
        </BottomSheetProvider>
        <StatusBar style="light" translucent={true} />
      </StickerProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
});

export default App;
