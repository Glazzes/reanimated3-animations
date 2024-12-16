import React from "react";
import { StyleSheet } from "react-native";
import { useDerivedValue } from "react-native-reanimated";
import {
  Canvas,
  Color,
  LinearGradient,
  Rect,
  vec,
} from "@shopify/react-native-skia";

import { useLyricsContext } from "../context";
import { BACKGROUND_COLOR } from "../constants/constants";

const GRADIENT_HEIGHT = 80;
const TRANSPARENT = "rgba(77, 128, 118, 0)";

const LyricsListGradient = () => {
  const { width, height, translate } = useLyricsContext();

  const upperColors = useDerivedValue<Color[]>(() => {
    const c = translate.value !== 0 ? BACKGROUND_COLOR : TRANSPARENT;
    return [c, TRANSPARENT];
  }, [translate]);

  return (
    <Canvas style={[styles.root, { width, height }]} pointerEvents="none">
      <Rect x={0} y={0} width={width} height={GRADIENT_HEIGHT}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, GRADIENT_HEIGHT)}
          colors={upperColors}
        />
      </Rect>

      <Rect x={0} y={height - 80} width={width} height={GRADIENT_HEIGHT}>
        <LinearGradient
          start={vec(0, height - GRADIENT_HEIGHT)}
          end={vec(0, height)}
          colors={[TRANSPARENT, BACKGROUND_COLOR]}
        />
      </Rect>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  root: {
    position: "absolute",
  },
});

export default LyricsListGradient;
