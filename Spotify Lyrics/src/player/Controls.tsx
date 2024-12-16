import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { clamp, runOnUI, withTiming } from "react-native-reanimated";

import Icon from "@expo/vector-icons/MaterialCommunityIcons";

import { useLyricsContext } from "../context";
import { ICON_COLOR, ICON_SIZE } from "../constants/constants";

const PLAY_BUTON_SIZE = 60;

type ControlsProps = {
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
};

const Controls: React.FC<ControlsProps> = ({ isPlaying, play, pause }) => {
  const {
    width,
    translate,
    baseListSize,
    translatedListSize,
    translationProgress,
  } = useLyricsContext();

  const [isTranslated, setIsTranslated] = useState<boolean>(false);

  const togglePlaying = () => {
    if (isPlaying) {
      pause();
      return;
    }

    play();
  };

  const toggleTranslation = () => {
    setIsTranslated((prev) => !prev);

    runOnUI(() => {
      "worklet";

      const toProgress = translationProgress.value === 1 ? 0 : 1;

      const basesize = baseListSize.value - width;
      const translatedSize = translatedListSize.value - width;
      const diff = translatedSize - basesize;

      let scrollPosition = 0;
      const normalizedTranslate = -1 * translate.value;

      if (toProgress === 1) {
        const pct = normalizedTranslate / basesize;
        scrollPosition = normalizedTranslate + pct * diff;
      } else {
        const pct = normalizedTranslate / translatedSize;
        scrollPosition = normalizedTranslate - pct * diff;
      }

      translationProgress.value = withTiming(toProgress);

      const upperBound =
        toProgress === 1
          ? translatedListSize.value - width
          : baseListSize.value - width;

      const toScroll = clamp(-1 * scrollPosition, -1 * upperBound, 0);
      translate.value = withTiming(toScroll);
    })();
  };

  return (
    <View style={styles.root}>
      <Pressable onPress={toggleTranslation}>
        <Icon
          name={isTranslated ? "translate-off" : "translate"}
          color={ICON_COLOR}
          size={ICON_SIZE}
        />
      </Pressable>
      <Pressable onPress={togglePlaying}>
        <View style={styles.playButton}>
          <Icon
            name={isPlaying ? "pause" : "play"}
            size={ICON_SIZE + 8}
            color={"#000"}
          />
        </View>
      </Pressable>
      <Icon name="share-variant-outline" color={ICON_COLOR} size={ICON_SIZE} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  playButton: {
    width: PLAY_BUTON_SIZE,
    height: PLAY_BUTON_SIZE,
    borderRadius: PLAY_BUTON_SIZE / 2,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Controls;
