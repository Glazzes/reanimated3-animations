import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useImage } from "@shopify/react-native-skia";

import Header from "./Header";
import Footer from "./Footer";
import EditableImage from "./EditableImage";
import { SizeVector } from "../types";

const MainScreen = () => {
  const { width } = useWindowDimensions();
  const image = useImage(require("../../assets/dalmatian.webp"));

  if (image === null) {
    return null;
  }

  const aspectRatio = image.width() / image.height();
  const screenDimensions: SizeVector<number> = {
    width: width * 0.75,
    height: (width * 0.75) / aspectRatio,
  };

  return (
    <View style={styles.container}>
      <Header />
      <EditableImage image={image} screenDimensions={screenDimensions} />
      <Footer image={image} screenDimensions={screenDimensions} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MainScreen;
