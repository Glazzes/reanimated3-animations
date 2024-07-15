import React, { useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  clamp,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  Canvas,
  Picture,
  Skia,
  createPicture,
  rect,
} from "@shopify/react-native-skia";

import {
  GRID_CELL_SIZE,
  PICKER_HEIGHT,
  PICKER_WIDTH,
  SPACING,
} from "../utils/constants";
import { buildColorGrid, getLuminance } from "./utils";
import { useVector } from "../utils/useVector";
import type { RGB } from "../utils/types";

type GridProps = {
  activeSelector: SharedValue<0 | 1 | 2>;
  color: SharedValue<RGB>;
};

const Grid: React.FC<GridProps> = ({ color, activeSelector }) => {
  const [grid] = useState(() => buildColorGrid());
  const picture = useMemo(
    () =>
      createPicture((canvas) => {
        const paint = Skia.Paint();

        for (let i = 0; i < grid.length; i++) {
          const item = grid[i]!;
          paint.setColor(Skia.Color(item.color));
          canvas.drawRect(
            rect(item.x, item.y, GRID_CELL_SIZE, GRID_CELL_SIZE),
            paint,
          );
        }
      }),
    [grid],
  );

  const translate = useVector(0, 0);

  const borderTL = useSharedValue<number>(0);
  const borderTR = useSharedValue<number>(0);
  const borderBL = useSharedValue<number>(0);
  const borderBR = useSharedValue<number>(0);

  const opacity = useSharedValue<number>(0);
  const borderWidth = useSharedValue<number>(1);
  const edgeColor = useSharedValue<string>("#000");

  const pan = Gesture.Pan()
    .onStart(() => {
      activeSelector.value = 0;

      opacity.value = 1;
      borderWidth.value = withTiming(1);
    })
    .onUpdate((e) => {
      const clampedX = clamp(e.x, 0, PICKER_WIDTH - GRID_CELL_SIZE);
      const clampedY = clamp(e.y, 0, PICKER_HEIGHT - GRID_CELL_SIZE);

      const indexX = Math.round(clampedX / GRID_CELL_SIZE);
      const indexY = Math.floor(clampedY / GRID_CELL_SIZE);

      translate.x.value = indexX * GRID_CELL_SIZE;
      translate.y.value = indexY * GRID_CELL_SIZE;

      const realIndex = indexX + indexY * 12;
      borderTL.value = realIndex === 0 ? SPACING / 2 : 0;
      borderTR.value = realIndex === 11 ? SPACING / 2 : 0;
      borderBL.value = realIndex === 108 ? SPACING / 2 : 0;
      borderBR.value = realIndex === 119 ? SPACING / 2 : 0;

      const currentColor = grid[realIndex];
      color.value = currentColor!.rawColor;

      const currentLuminance = getLuminance(currentColor!.rawColor);
      const blackLuminance = getLuminance([0, 0, 0]);

      const ratio =
        currentLuminance > blackLuminance
          ? (blackLuminance + 0.05) / (currentLuminance + 0.05)
          : (currentLuminance + 0.05) / (blackLuminance + 0.05);

      if (ratio < 1 / 6) {
        edgeColor.value = "#000";
      } else {
        edgeColor.value = "#fff";
      }
    })
    .onEnd(() => {
      borderWidth.value = withTiming(3);
    });

  const selectorStyles = useAnimatedStyle(() => ({
    borderWidth: borderWidth.value,
    borderColor: edgeColor.value,
    borderTopLeftRadius: borderTL.value,
    borderTopRightRadius: borderTR.value,
    borderBottomLeftRadius: borderBL.value,
    borderBottomRightRadius: borderBR.value,
    opacity: opacity.value,
    transform: [
      { translateX: translate.x.value },
      { translateY: translate.y.value },
    ],
  }));

  useAnimatedReaction(
    () => activeSelector.value,
    (value) => {
      if (value !== 0) {
        opacity.value = withTiming(0);
      }
    },
  );

  return (
    <View style={styles.root}>
      <GestureDetector gesture={pan}>
        <Animated.View style={styles.border}>
          <Canvas style={styles.canvas}>
            <Picture picture={picture} />
          </Canvas>
          <Animated.View style={[styles.selector, selectorStyles]} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: PICKER_WIDTH + SPACING * 2,
    height: PICKER_HEIGHT,
    alignItems: "center",
  },
  border: {
    overflow: "hidden",
    borderRadius: SPACING / 2,
  },
  canvas: {
    width: PICKER_WIDTH,
    height: PICKER_HEIGHT,
  },
  selector: {
    width: GRID_CELL_SIZE,
    height: GRID_CELL_SIZE,
    borderWidth: 4,
    position: "absolute",
  },
});

export default Grid;
