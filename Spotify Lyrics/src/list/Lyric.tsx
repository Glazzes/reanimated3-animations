import React from "react";
import { LayoutChangeEvent, StyleSheet } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Size } from "../types";
import { BACKGROUND_COLOR } from "../constants/constants";
import { lyrics, translation } from "../constants/lyrics";

type LyricProps = {
  index: number;
  activeLyric: SharedValue<number>;
  lyricSizes: SharedValue<Size[]>;
  progress: SharedValue<number>;
};

const Lyric: React.FC<LyricProps> = ({
  index,
  activeLyric,
  lyricSizes,
  progress,
}) => {
  const lyricSize = useSharedValue<number>(0);
  const translationSize = useSharedValue<number>(0);
  const translate = useSharedValue<number>(0);

  const measureLyric = (e: LayoutChangeEvent) => {
    lyricSize.value = e.nativeEvent.layout.height;
  };

  const measureTranslation = (e: LayoutChangeEvent) => {
    translationSize.value = e.nativeEvent.layout.height;
  };

  const containerStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translate.value * progress.value }],
    };
  }, [translate, progress]);

  const lyricStyles = useAnimatedStyle(() => {
    const isActive = activeLyric.value - 1 >= index;

    return {
      color: isActive ? "#f4f4f4" : "#000",
    };
  }, [index, activeLyric]);

  const translationStyles = useAnimatedStyle(() => {
    const isActive = activeLyric.value - 1 >= index;

    return {
      color: isActive ? "#f4f4f4" : "#000",
      transform: [{ translateY: translationSize.value * progress.value }],
    };
  }, [index, activeLyric, progress, translationSize]);

  useAnimatedReaction(
    () => ({
      base: lyricSize.value,
      translated: translationSize.value,
    }),
    (val) => {
      if (val.base === 0 || val.translated === 0) return;

      lyricSizes.modify((prev) => {
        "worklet";

        prev[index] = {
          baseHeight: val.base,
          translatedHeight: val.base + val.translated,
        };

        return prev;
      });
    },
    [index, lyricSize, translationSize],
  );

  useAnimatedReaction(
    () => lyricSizes.value,
    (val) => {
      if (val.length !== lyrics.data.length) return;

      let acc = 0;
      for (let i = 0; i < index; i++) {
        acc += val[i].translatedHeight - val[i].baseHeight;
      }

      translate.value = acc;
    },
    [index, lyricSizes],
  );

  return (
    <Animated.View style={[styles.root, containerStyles]}>
      <Animated.Text
        onLayout={measureLyric}
        style={[styles.lyric, lyricStyles]}
      >
        {lyrics.data[index].lyric}
      </Animated.Text>

      <Animated.Text
        style={[styles.translation, translationStyles]}
        onLayout={measureTranslation}
      >
        {translation.data[index].translation}
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    justifyContent: "flex-end",
  },
  lyric: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Circular-Bold",
    backgroundColor: BACKGROUND_COLOR,
  },
  translation: {
    fontSize: 16,
    fontWeight: "100",
    fontFamily: "Circular-Medium",
    position: "absolute",
    zIndex: -1,
  },
});

export default Lyric;
