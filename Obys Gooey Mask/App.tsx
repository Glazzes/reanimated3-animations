import { StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";

import GooeyMask from "./src";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <GooeyMask />
      <StatusBar style="light" translucent={true} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
