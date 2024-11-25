import React from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";

import { StickerProvider, BottomSheetProvider } from "@providers/index";
import { MainScreen } from "./src/main-screen";
import {
  Canvas,
  createPicture,
  FilterMode,
  MipmapMode,
  Picture,
  rect,
  Skia,
  useImage,
} from "@shopify/react-native-skia";

const Test = () => {
  const image = useImage(require("./assets/stickers/0+face_fearful.webp"));
  const picture = createPicture((canvas) => {
    const bg = Skia.Paint();
    bg.setColor(Skia.Color("orange"));
    canvas.drawRect(rect(0, 0, 200, 200), bg);

    canvas.save();
    canvas.scale(-1, 1);
    canvas.translate(-200, 0);

    canvas.translate(-50, 50);
    canvas.rotate(135, 100, 100);

    if (image !== null) {
      canvas.drawImageRectOptions(
        image,
        rect(0, 0, image.width(), image.height()),
        rect(50, 50, 100, 100),
        FilterMode.Linear,
        MipmapMode.Linear,
      );
    }

    canvas.restore();
  });

  return (
    <View style={styles.root}>
      <Canvas style={{ width: 200, height: 200 }}>
        <Picture picture={picture} />
      </Canvas>
    </View>
  );
};

const App = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <StickerProvider>
        <BottomSheetProvider>
          <MainScreen />
          <StatusBar style="light" translucent={true} />
        </BottomSheetProvider>
      </StickerProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});

export default App;
