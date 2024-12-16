import React from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  clamp,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import Lyric from "./Lyric";
import LyricsListGradient from "./LyricsListGradient";
import Acknowledgements from "./Acknowledgements";

import { useLyricsContext } from "../context";

import { lyrics } from "../constants/lyrics";
import { GAP } from "../constants/constants";

const LyricsList = () => {
  const {
    width,
    height,
    setWidth,
    setHeight,
    activeLyric,
    translate,
    playbackTime,
    baseListSize,
    translatedListSize,
    lyricSizes,
    translationProgress,
    scrollPositions,
    isSeeking,
  } = useLyricsContext();

  const measureContainer = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
    setHeight(e.nativeEvent.layout.height);
  };

  const clampTranslation = (value: number) => {
    "worklet";

    const upperBound = 0;
    const lowerBound =
      translationProgress.value === 1
        ? translatedListSize.value - height
        : baseListSize.value - height;

    return clamp(value, -1 * lowerBound, upperBound);
  };

  const offset = useSharedValue<number>(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      offset.value = translate.value;
    })
    .onUpdate((e) => {
      translate.value = clampTranslation(e.translationY + offset.value);
    })
    .onEnd((e) => {
      const upperBound =
        translationProgress.value === 1
          ? translatedListSize.value - height
          : baseListSize.value - height;

      translate.value = withDecay({
        velocity: e.velocityY,
        clamp: [-1 * upperBound, 0],
      });
    });

  const animatedStyle = useAnimatedStyle(() => {
    const height =
      translatedListSize.value === 0 ? undefined : translatedListSize.value;

    return {
      height,
      transform: [{ translateY: translate.value }],
    };
  }, [translatedListSize, translate]);

  useAnimatedReaction(
    () => playbackTime.value,
    (val) => {
      const currentLyricSize = lyricSizes.value[activeLyric.value];
      if (currentLyricSize === undefined) return;

      const nextTime = lyrics.data[activeLyric.value].time;
      if (val <= nextTime) return;

      if (isSeeking.value) return;

      let offsetY = 0;
      for (let i = 0; i < activeLyric.value; i++) {
        const acc =
          translationProgress.value === 1
            ? lyricSizes.value[i].translatedHeight
            : lyricSizes.value[i].baseHeight;

        offsetY += acc + GAP;
      }

      const lyricSize =
        translationProgress.value === 1
          ? currentLyricSize.translatedHeight
          : currentLyricSize.translatedHeight;

      const itemEnd = offsetY + lyricSize;

      const normalizedTranslate = -1 * translate.value;
      const inFrame =
        itemEnd >= normalizedTranslate + height / 2 &&
        offsetY < normalizedTranslate + height;

      if (inFrame) {
        const to = clampTranslation(-1 * (itemEnd - height / 2));
        translate.value = withTiming(to);
      }

      activeLyric.value += 1;
    },
    [playbackTime, height],
  );

  useAnimatedReaction(
    () => lyricSizes.value,
    (val) => {
      if (val.length !== lyrics.data.length) return;

      let base = 0;
      let translated = 0;
      for (let i = 0; i < val.length; i++) {
        base += val[i].baseHeight + GAP;
        translated += val[i].translatedHeight + GAP;

        const timeStamp = lyrics.data[i].time;
        const basePosition = Math.max(0, base - GAP - height / 2);
        const translatedPosition = Math.max(0, translated - GAP - height / 2);

        scrollPositions.modify((prev) => {
          "worklet";

          prev.timestamps[i] = timeStamp;
          prev.basePositions[i] = basePosition;
          prev.translatedPositions[i] = translatedPosition;

          return prev;
        });
      }

      baseListSize.value = base + height / 2;
      translatedListSize.value = translated + height / 2;
    },
    [height, lyricSizes],
  );

  return (
    <View style={styles.root} onLayout={measureContainer}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {lyrics.data.map((item, index) => {
          return (
            <Lyric
              key={`${item.lyric}-${index}`}
              index={index}
              activeLyric={activeLyric}
              lyricSizes={lyricSizes}
              progress={translationProgress}
            />
          );
        })}

        <Acknowledgements />
      </Animated.View>

      <LyricsListGradient />

      <GestureDetector gesture={panGesture}>
        <Animated.View style={{ width, height, position: "absolute" }} />
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
  },
  container: {
    paddingHorizontal: GAP,
    gap: GAP,
  },
});

export default LyricsList;
