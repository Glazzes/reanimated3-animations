import React from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  clamp,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { Canvas, Fill, Group, Shader, Skia } from "@shopify/react-native-skia";
import { StatusBar } from "expo-status-bar";

import { TAU, RAD2DEG, DEG150, DEG210 } from "./utils/constants";
import { HUE_SHADER, SELECTION_SHADER } from "./utils/shader";
import { useVector } from "./utils/useVector";
import { hsl2rgb } from "./utils/color";
import { rotate2d } from "./utils/rotate2d";

const STROKE_WIDTH = 25;
const triangleBase = 200;
const width = Math.cos(Math.PI / 6) * triangleBase;
const radiusDiff = Math.tan(Math.PI / 6) * (triangleBase / 2);
const radius = width - radiusDiff + STROKE_WIDTH;

const triangleClipPath = Skia.Path.MakeFromSVGString(`
  M 0 0 l ${width} ${triangleBase / 2} l ${-width} ${triangleBase / 2}
`)!;

const circleClipPath = Skia.Path.MakeFromSVGString(`
  M ${STROKE_WIDTH / 2} ${radius} 
  a 1 1 0 0 1 ${radius * 2 - STROKE_WIDTH} ${0} 
  a 1 1 0 0 1 ${-1 * radius * 2 + STROKE_WIDTH} ${0} 
  z
`)!;

circleClipPath.stroke({ width: STROKE_WIDTH });

function getInitalHue() {
  const [r, g, b] = hsl2rgb(0, 1, 0.5);
  return `rgba(${r}, ${g}, ${b}, 1)`;
}

function getInitalColor() {
  const [r, g, b] = hsl2rgb(0, radiusDiff / width, 0.5);
  return `rgba(${r}, ${g}, ${b}, 1)`;
}

const hueShader = Skia.RuntimeEffect.Make(HUE_SHADER)!;
const shader = Skia.RuntimeEffect.Make(SELECTION_SHADER)!;

const Pinga: React.FC = () => {
  const translate = useVector((radius - STROKE_WIDTH / 2) * Math.cos(0), 0);
  const offset = useVector(0, 0);

  const select = useVector(0, 0);
  const selectOffset = useVector(0, 0);

  const angle = useSharedValue<number>(0);

  const hueColor = useSharedValue<string>(getInitalHue());
  const finalColor = useSharedValue<string>(getInitalColor());

  const shaderUniforms = useDerivedValue(() => {
    return {
      hue: angle.value * RAD2DEG,
      canvas: [width, triangleBase],
    };
  }, [angle, width, triangleBase]);

  useAnimatedReaction(
    () => angle.value * RAD2DEG,
    (value) => {
      const [r, g, b] = hsl2rgb(value, 1, 0.5);
      hueColor.value = `rgba(${r}, ${g}, ${b}, 1)`;
    },
    [angle],
  );

  useAnimatedReaction(
    () => ({
      hue: angle.value * RAD2DEG,
      x: select.x.value,
      y: select.y.value,
    }),
    (data) => {
      const x = (data.x + radiusDiff) / width;

      const [r, g, b] = hsl2rgb(
        data.hue,
        1 - (1 - x) * (1 - x),
        (triangleBase - (data.y + triangleBase / 2)) / triangleBase,
      );
      finalColor.value = `rgba(${r}, ${g}, ${b}, 1)`;
    },
    [angle, select],
  );

  const huePanGesture = Gesture.Pan()
    .hitSlop({ vertical: 5, horizontal: 5 })
    .onBegin((_) => {
      offset.x.value = translate.x.value;
      offset.y.value = translate.y.value;
    })
    .onUpdate((e) => {
      const x = offset.x.value + e.translationX;
      const y = -1 * (offset.y.value + e.translationY);

      angle.value = (Math.atan2(y, x) + TAU) % TAU;
      translate.x.value = (radius - STROKE_WIDTH / 2) * Math.cos(angle.value);
      translate.y.value =
        -1 * (radius - STROKE_WIDTH / 2) * Math.sin(angle.value);
    });

  const colorPanGesture = Gesture.Pan()
    .onBegin(() => {
      selectOffset.x.value = select.x.value;
      selectOffset.y.value = select.y.value;
    })
    .onUpdate((e) => {
      const rotated = rotate2d(e.translationX, e.translationY, angle.value);
      const x = selectOffset.x.value + rotated.x;
      const y = selectOffset.y.value + rotated.y;

      const normalizedX = clamp(
        x - (radius - STROKE_WIDTH),
        -1 * (radius - STROKE_WIDTH + radiusDiff),
        0,
      );
      const normalizedY = -1 * y;

      const tempAngle = (Math.atan2(normalizedY, normalizedX) + TAU) % TAU;
      const cangle = clamp(tempAngle, DEG150, DEG210);
      const toY = Math.abs(Math.tan(cangle) * normalizedX);

      select.x.value = clamp(x, -1 * radiusDiff, radius - STROKE_WIDTH);
      select.y.value = clamp(y, -1 * toY, toY);
    });

  const triangleStyles = useAnimatedStyle(() => ({
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: `${-1 * angle.value}rad` }],
  }));

  const hueSelectorStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: hueColor.value,
      transform: [
        { translateX: translate.x.value },
        { translateY: translate.y.value },
        { rotate: `${Math.PI / 2 - angle.value}rad` },
      ],
    };
  });

  const colorSelectorStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: finalColor.value,
      transform: [
        { translateX: select.x.value },
        { translateY: select.y.value },
      ],
    };
  });

  const finalColorStyles = useAnimatedStyle(() => ({
    backgroundColor: finalColor.value,
  }));

  const sliderStyle: ViewStyle = {
    width: radius * 2,
    height: radius * 2,
    position: "absolute",
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent={true} />

      <View style={styles.contaier}>
        <Canvas style={sliderStyle}>
          <Group clip={circleClipPath}>
            <Fill>
              <Shader
                source={hueShader}
                uniforms={{ canvas: [radius * 2, radius * 2] }}
              />
            </Fill>
          </Group>
        </Canvas>

        <Animated.View style={triangleStyles}>
          <Canvas style={styles.canvas}>
            <Group clip={triangleClipPath}>
              <Fill>
                <Shader source={shader} uniforms={shaderUniforms} />
              </Fill>
            </Group>
          </Canvas>

          <GestureDetector gesture={colorPanGesture}>
            <Animated.View style={[styles.selector, colorSelectorStyle]} />
          </GestureDetector>
        </Animated.View>

        <GestureDetector gesture={huePanGesture}>
          <Animated.View
            style={[styles.selector, styles.hueSelector, hueSelectorStyle]}
          />
        </GestureDetector>
      </View>

      <Animated.View style={[styles.colorContainer, finalColorStyles]} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#2c2c2c",
  },
  contaier: {
    width: radius * 2,
    height: radius * 2,
    justifyContent: "center",
    alignItems: "center",
  },
  canvas: {
    width,
    height: triangleBase,
    transform: [{ translateX: (radius * 2 - width) / 2 - STROKE_WIDTH }],
  },
  selector: {
    width: STROKE_WIDTH,
    height: STROKE_WIDTH,
    borderColor: "#fff",
    borderWidth: 4,
    borderRadius: STROKE_WIDTH / 2,
    position: "absolute",
  },
  hueSelector: {
    width: STROKE_WIDTH / 1.5,
    borderRadius: STROKE_WIDTH / 8,
  },
  wheel: {
    width: radius * 2,
    height: radius * 2,
    position: "absolute",
    borderRadius: radius,
    borderColor: "#fff",
  },
  colorContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: "#fff",
  },
});

export default Pinga;
