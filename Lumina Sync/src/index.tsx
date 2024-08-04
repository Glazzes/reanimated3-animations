import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  Canvas,
  Fill,
  Shader,
  Skia,
  useClock,
} from "@shopify/react-native-skia";
import { StatusBar } from "expo-status-bar";

import { SHADER } from "./utils/shader";
import { rotate2d } from "./utils/rotate2d";

const { width, height } = Dimensions.get("window");
const shader = Skia.RuntimeEffect.Make(SHADER)!;

const SIZE = height;
const INDICATOR_SIZE = 44;
const ANGLE = Math.PI / 2.5;

const initalPosition = rotate2d(
  {
    x: width / 2 - INDICATOR_SIZE / 2,
    y: height / 2 - INDICATOR_SIZE / 2,
  },
  -1 * ANGLE,
);

export default function App() {
  const translateX = useSharedValue<number>(initalPosition.x);
  const translateY = useSharedValue<number>(initalPosition.y);
  const offsetX = useSharedValue<number>(0);
  const offsetY = useSharedValue<number>(0);

  const clock = useClock();
  const uniforms = useDerivedValue(() => {
    return {
      clock: clock.value * 0.0003,
      size: [SIZE, SIZE * 2],
      circleCenter: [
        0.5 + translateX.value / SIZE,
        1 + translateY.value / SIZE,
      ],
    };
  }, [clock, translateX, translateY]);

  const pan = Gesture.Pan()
    .onStart(() => {
      offsetX.value = translateX.value;
      offsetY.value = translateY.value;
    })
    .onUpdate((e) => {
      const rotated = rotate2d(
        { x: e.translationX, y: e.translationY },
        -1 * ANGLE,
      );

      translateX.value = offsetX.value + rotated.x;
      translateY.value = offsetY.value + rotated.y;
    });

  const indicatorStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  }, [translateX, translateY]);

  return (
    <View style={styles.container}>
      <View style={styles.rotationContainer}>
        <Canvas style={styles.canvas}>
          <Fill>
            <Shader source={shader} uniforms={uniforms} />
          </Fill>
        </Canvas>

        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.indicator, indicatorStyles]} />
        </GestureDetector>
      </View>

      <Text style={styles.title}>Lumina Sync</Text>
      <StatusBar style="light" translucent={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#151515",
    alignItems: "center",
    justifyContent: "center",
  },
  rotationContainer: {
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: `${ANGLE}rad` }],
  },
  canvas: {
    width: SIZE,
    height: SIZE * 2,
  },
  indicator: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    borderWidth: 3,
    borderColor: "#fff",
    position: "absolute",
  },
  title: {
    color: "#fff",
    fontSize: 40,
    position: "absolute",
    left: 16,
    bottom: 16,
    fontWeight: "700",
  },
});
