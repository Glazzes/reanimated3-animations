import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  type SharedValue,
} from "react-native-reanimated";
import {
  Canvas,
  Circle,
  Group,
  Path,
  Rect,
  Skia,
} from "@shopify/react-native-skia";

import { INDICATOR_SIZE } from "../../utils/constants";
import type { RGB } from "../../utils/types";

type OpacitySliderIndicatorProps = {
  color: SharedValue<RGB>;
  opacity: SharedValue<number>;
  translateX: SharedValue<number>;
};

const radius = INDICATOR_SIZE / 2;
const colors = ["#fff", "#000"];

const upperDivider = Skia.Path.MakeFromSVGString(
  `M 0 0 l ${INDICATOR_SIZE} 0 l ${-1 * INDICATOR_SIZE} ${INDICATOR_SIZE} z`,
)!;

const lowerDivider = Skia.Path.MakeFromSVGString(
  `M 0 ${INDICATOR_SIZE} l ${INDICATOR_SIZE} 0 l 0 ${-1 * INDICATOR_SIZE} z`,
)!;

const clipPath = Skia.Path.Make();
clipPath.addCircle(radius, radius, radius);

const OpacitySliderIndicator: React.FC<OpacitySliderIndicatorProps> = ({
  color,
  opacity,
  translateX,
}) => {
  const checkerSize = 3;
  const columns = Math.ceil(INDICATOR_SIZE / checkerSize);
  const checkers = new Array(columns ** 2).fill(0);

  const backgroundColor = useDerivedValue(() => {
    const [r, g, b] = color.value;
    return `rgba(${r}, ${g}, ${b}, 1)`;
  });

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.root, animatedStyles]}>
      <Canvas style={styles.canvas}>
        <Group clip={clipPath}>
          {checkers.map((_, index) => {
            const x = index % columns;
            const y = Math.floor(index / columns);

            let checkerColor = x % 2 === 0 ? colors[0] : colors[1];
            if (y % 2 === 1) {
              checkerColor = checkerColor === colors[0] ? colors[1] : colors[0];
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
          <Path path={upperDivider} color={backgroundColor} />
          <Path path={lowerDivider} color={backgroundColor} opacity={opacity} />

          <Circle
            cx={radius}
            cy={radius}
            r={radius - 2}
            color={"#fff"}
            strokeWidth={4}
            style={"stroke"}
          />
        </Group>
      </Canvas>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    position: "absolute",
  },
  canvas: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
  },
});

export default OpacitySliderIndicator;
