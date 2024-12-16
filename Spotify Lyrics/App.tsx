import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";

import Appbar from "./src/Appbar";
import LyricsList from "./src/list/LyricsList";
import Player from "./src/player/Player";

import { LyricsContext } from "./src/context";
import { ScrollPositions, Size } from "./src/types";
import { BACKGROUND_COLOR } from "./src/constants/constants";

const App = () => {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  const [fontsLoaded] = useFonts({
    "Circular-Medium": require("./assets/fonts/Circular-Medium.ttf"),
    "Circular-Bold": require("./assets/fonts/Circular-Bold.ttf"),
  });

  const translate = useSharedValue<number>(0);
  const activeLyric = useSharedValue<number>(0);
  const lyricSizes = useSharedValue<Size[]>([]);
  const baseListSize = useSharedValue<number>(0);
  const translatedListSize = useSharedValue<number>(0);
  const progress = useSharedValue<number>(0);
  const playbackTime = useSharedValue<number>(0);
  const isSeeking = useSharedValue<boolean>(false);

  const scrollPositions = useSharedValue<ScrollPositions>({
    timestamps: [],
    basePositions: [],
    translatedPositions: [],
  });

  if (!fontsLoaded) return null;

  return (
    <LyricsContext.Provider
      value={{
        width,
        height,
        setWidth,
        setHeight,
        activeLyric,
        translate,
        playbackTime,
        lyricSizes,
        baseListSize,
        translatedListSize,
        scrollPositions,
        translationProgress: progress,
        isSeeking,
      }}
    >
      <View style={styles.root}>
        <Appbar />
        <LyricsList />
        <Player />
      </View>
      <StatusBar translucent={true} />
    </LyricsContext.Provider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
});

export default gestureHandlerRootHOC(App);
