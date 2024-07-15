import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import ColorPicker from "./src";

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ColorPicker />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
