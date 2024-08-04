import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Lumina from "./src";

export default function App() {
  return (
    <GestureHandlerRootView>
      <Lumina />
    </GestureHandlerRootView>
  );
}
