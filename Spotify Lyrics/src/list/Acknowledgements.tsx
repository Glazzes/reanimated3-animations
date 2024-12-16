import React from "react";
import { StyleSheet, Text } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { GAP, MEDIUM_FONT } from "../constants/constants";
import { useLyricsContext } from "../context";

const Acknowledgements = () => {
  const { height, baseListSize, translatedListSize, translationProgress } =
    useLyricsContext();

  const animatedStyles = useAnimatedStyle(() => {
    const diff = translatedListSize.value - baseListSize.value;

    return {
      height: height / 2,
      justifyContent: "flex-end",
      paddingBottom: GAP,
      transform: [{ translateY: diff * translationProgress.value }],
    };
  }, [height, baseListSize, translatedListSize, translationProgress]);

  return (
    <Animated.View style={animatedStyles}>
      <Text style={styles.caption}>Lyrics provided by MusixMatch</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  caption: {
    fontFamily: MEDIUM_FONT,
  },
});

export default Acknowledgements;
