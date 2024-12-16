import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, {
  Extrapolation,
  cancelAnimation,
  clamp,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Constants from "expo-constants";

import ReText from "./ReText";
import Controls from "./Controls";

import { GAP, MEDIUM_FONT } from "../constants/constants";

import { lyrics } from "../constants/lyrics";

import { mapTimeToText } from "../utils";
import { useLyricsContext } from "../context";
import { Audio } from "expo-av";

const INDICATOR_SIZE = 12;
const PLAY_BUTON_SIZE = 60;

const statusBarHeight = Constants.statusBarHeight;

const timeInputRange: number[] = [0];
const activeIdOutputRange: number[] = [0];
for (let i = 0; i < lyrics.data.length; i++) {
  activeIdOutputRange.push(i + 1);
  timeInputRange.push(lyrics.data[i].time);
}

const Player = () => {
  const {
    activeLyric,
    translate,
    translationProgress,
    playbackTime,
    isSeeking,
    scrollPositions,
  } = useLyricsContext();

  const { width } = useWindowDimensions();

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playbackObject = useRef(new Audio.Sound()).current;

  const innerTranslate = useSharedValue<number>(0);
  const innerOffset = useSharedValue<number>(0);

  const play = async () => {
    setIsPlaying(true);

    await playbackObject.setPositionAsync(playbackTime.value * 1000);
    await playbackObject.playAsync();
  };

  const pause = () => {
    setIsPlaying(false);
    playbackObject.pauseAsync();
  };

  const textTime = useDerivedValue<string>(() => {
    return mapTimeToText(playbackTime.value);
  }, [playbackTime]);

  const panGesture = Gesture.Pan()
    .hitSlop({ vertical: 16, horizontal: 16 })
    .onStart(() => {
      cancelAnimation(playbackTime);
      runOnJS(pause)();

      isSeeking.value = true;
      innerOffset.value = innerTranslate.value;
    })
    .onUpdate((e) => {
      const upperBound = width - GAP * 2 - INDICATOR_SIZE;
      const to = e.translationX + innerOffset.value;
      innerTranslate.value = clamp(to, 0, upperBound);

      playbackTime.value =
        (innerTranslate.value / upperBound) * lyrics.duration;

      const scrollRange =
        translationProgress.value === 1
          ? scrollPositions.value.translatedPositions
          : scrollPositions.value.basePositions;

      const toScroll = interpolate(
        playbackTime.value,
        scrollPositions.value.timestamps,
        scrollRange,
        Extrapolation.CLAMP,
      );

      const currentId = interpolate(
        playbackTime.value,
        timeInputRange,
        activeIdOutputRange,
        Extrapolation.CLAMP,
      );

      translate.value = -1 * toScroll;
      activeLyric.value = Math.floor(currentId);
    })
    .onEnd(() => {
      isSeeking.value = false;
    });

  useAnimatedReaction(
    () => ({ time: playbackTime.value, seeking: isSeeking.value }),
    (val) => {
      if (val.seeking) return;

      const upperBound = width - GAP * 2 - INDICATOR_SIZE;
      innerTranslate.value = (val.time / lyrics.duration) * upperBound;
    },
    [width, playbackTime, isSeeking],
  );

  const barStyles = useAnimatedStyle(() => {
    return {
      height: 4,
      width: innerTranslate.value,
      borderRadius: 4,
      backgroundColor: "#fff",
    };
  }, [innerTranslate]);

  const indicatorStyles = useAnimatedStyle(() => {
    const lowerBound = -1 * (width / 2 - GAP - INDICATOR_SIZE / 2);

    return {
      transform: [{ translateX: lowerBound + innerTranslate.value }],
    };
  }, [width, innerTranslate]);

  useEffect(() => {
    playbackObject.loadAsync(require("../../assets/music/Night-Sky.mp3"));

    playbackObject.setProgressUpdateIntervalAsync(16);
    playbackObject.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        playbackTime.value = status.positionMillis / 1000;
      }
    });
  }, [playbackTime, playbackObject]);

  return (
    <View style={styles.root}>
      <View style={styles.playbackContainer}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: width - GAP * 2 }]}>
            <Animated.View style={barStyles} />
          </View>
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[styles.progressIndicator, indicatorStyles]}
            />
          </GestureDetector>
        </View>

        <View style={styles.timeContainer}>
          <ReText text={textTime} />
          <Text style={styles.time}>{mapTimeToText(lyrics.duration)}</Text>
        </View>
      </View>

      <Controls isPlaying={isPlaying} play={play} pause={pause} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: GAP,
    paddingVertical: statusBarHeight,
  },
  playbackContainer: {
    gap: 4,
  },
  progressBarContainer: {
    height: INDICATOR_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 4,
  },
  progressIndicator: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    backgroundColor: "#fff",
    position: "absolute",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  time: {
    color: "#fff",
    opacity: 0.5,
    fontSize: 12.5,
    fontFamily: MEDIUM_FONT,
  },
  controls: {
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

export default Player;
