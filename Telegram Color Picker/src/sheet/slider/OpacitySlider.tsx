import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  clamp,
  interpolate,
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Canvas, LinearGradient, Rect, vec } from "@shopify/react-native-skia";

import {
  GRID_CELL_SIZE,
  INDICATOR_SIZE,
  PICKER_WIDTH,
  SPACING,
} from "../../utils/constants";
import type { RGB } from "../../utils/types";
import OpacitySliderIndicator from "./OpacitySliderIndicator";

type OpacitySliderProps = {
  color: SharedValue<RGB>;
  opacity: SharedValue<number>;
};

const BOUND = (PICKER_WIDTH - INDICATOR_SIZE) / 2;

const colors = ["#000", "#fff"];

const OpacitySlider: React.FC<OpacitySliderProps> = ({ color, opacity }) => {
  const checkerSize = GRID_CELL_SIZE / 4;
  const columns = Math.ceil(PICKER_WIDTH / checkerSize);
  const checkers = new Array(columns * 2).fill(0);

  const translateX = useSharedValue<number>(BOUND);
  const offset = useSharedValue<number>(0);

  const sliderGradient = useDerivedValue(() => {
    const [r, g, b] = color.value;
    const start = `rgba(${r!}, ${g!}, ${b!}, 0.2)`;
    const end = `rgba(${r!}, ${g!}, ${b!}, 0.9)`;

    return [start, end];
  }, [color]);

  const pan = Gesture.Pan()
    .onStart((e) => {
      offset.value = e.x - PICKER_WIDTH / 2;
    })
    .onUpdate((e) => {
      const toX = offset.value + e.translationX;
      translateX.value = clamp(toX, -1 * BOUND, BOUND);
      opacity.value = interpolate(
        translateX.value,
        [-1 * BOUND, BOUND],
        [0, 1],
      );
    });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={styles.canvasContainer}>
        <View style={styles.canvasBorder}>
          <Canvas style={[styles.canvas]}>
            {checkers.map((_, index) => {
              const x = index % columns;
              const y = Math.floor(index / columns);

              let checkerColor = x % 2 === 0 ? colors[0] : colors[1];
              if (y % 2 === 1) {
                checkerColor =
                  checkerColor === colors[0] ? colors[1] : colors[0];
              }

              return (
                <Rect
                  key={`checker-${index}`}
                  x={x * checkerSize}
                  y={y * checkerSize}
                  width={checkerSize}
                  height={checkerSize}
                  color={checkerColor}
                />
              );
            })}

            <Rect x={0} y={0} width={PICKER_WIDTH} height={GRID_CELL_SIZE / 2}>
              <LinearGradient
                colors={sliderGradient}
                start={vec(0, 0)}
                end={vec(PICKER_WIDTH, 0)}
              />
            </Rect>
          </Canvas>
        </View>

        <OpacitySliderIndicator
          color={color}
          opacity={opacity}
          translateX={translateX}
        />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  canvasContainer: {
    width: PICKER_WIDTH,
    height: INDICATOR_SIZE,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: SPACING,
  },
  canvas: {
    width: PICKER_WIDTH,
    height: GRID_CELL_SIZE / 2,
  },
  canvasBorder: {
    borderRadius: PICKER_WIDTH / 2,
    overflow: "hidden",
  },
});

export default OpacitySlider;
