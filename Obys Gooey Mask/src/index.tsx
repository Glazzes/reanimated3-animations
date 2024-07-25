import React from "react";
import Animated, {
  Easing,
  WithTimingConfig,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { View, StyleSheet, useWindowDimensions, ViewStyle } from "react-native";
import {
  Canvas,
  Fill,
  ImageShader,
  Shader,
  Skia,
  useClock,
  useImage,
} from "@shopify/react-native-skia";

import { SIMPLEX_NOSE_GL, useVector } from "./utils";

const CURSOR_SIZE = 50;

const shader = Skia.RuntimeEffect.Make(`
  uniform shader greyscale;
  uniform shader colorful;
  uniform vec2 size;
  uniform vec2 gesturePosition;
  uniform float time;
  uniform float scale;

  uniform float progress;
  uniform float waveIntensity;

  ${SIMPLEX_NOSE_GL}

  vec4 main(vec2 xy) {
    float aspectRatio = size.x / size.y;
    vec2 normalizedXY = xy / size;
    normalizedXY.y = normalizedXY.y / aspectRatio;

    vec2 gesturePosition = gesturePosition / size;
    gesturePosition.y /= aspectRatio;

    vec2 p = vec2(normalizedXY.x * 9, (-1 * normalizedXY.y * 9) + time * 3.5);
    float noise = simplex3d(vec3(p, time));
    noise = (noise + 1) / 2;
    float val = noise * 0.4 * progress;

    float distanceFromGesture = distance(normalizedXY, gesturePosition);
    float u = distanceFromGesture / 3;
    float mouseMetaball = u * max(5, 10 - 25 * u);
    mouseMetaball = clamp(1 - mouseMetaball, 0, 1.);

    float alpha = step((val + mouseMetaball) * progress, 0.5);

    if(alpha == 1) { 
      normalizedXY;
      float wave1 = size.x * 0.01 * sin(normalizedXY.x * 5.0 + time * 1.4) * waveIntensity;
      float wave2 = size.y * 0.01 * sin(normalizedXY.y * 6.0 + time * 2) * waveIntensity;
      float wave3 = size.x * 0.01 * cos(normalizedXY.x * 4.0 + time * 1.3) * waveIntensity;
      float wave4 = size.y * 0.01 * cos(normalizedXY.y * 4.5 + time * 1.9) * waveIntensity;

      vec2 center = size / 2;
      xy -= center;
      xy = mat2(scale, 0, 0, scale) * xy;
      xy += center;

      xy.x += wave1 + wave2;
      xy.y += wave3 + wave4;

      return greyscale.eval(xy);
    }

    return colorful.eval(xy);
  }
`)!;

const config: WithTimingConfig = {
  duration: 1000,
  easing: Easing.linear,
};

const Index = () => {
  const { width, height } = useWindowDimensions();
  const canvasWidth = width * 0.75;
  const canvasHeight = canvasWidth / (width / height);

  const clock = useClock();
  const greyScale = useImage(require("../assets/images/greyscale.jpg"));
  const colorful = useImage(require("../assets/images/colorful.jpg"));

  const translate = useVector(0, 0);
  const offset = useVector(0, 0);

  const indicatorScale = useSharedValue<number>(1);
  const scale = useSharedValue<number>(1);
  const waveIntensity = useSharedValue<number>(0);
  const progress = useSharedValue<number>(0);

  const verifyInBoundsPosition = () => {
    "worklet";
    const offsetX = canvasWidth / 2;
    const offsetY = canvasHeight / 2;

    return (
      translate.x.value >= -1 * offsetX &&
      translate.x.value <= offsetX &&
      translate.y.value >= -1 * offsetY &&
      translate.y.value <= offsetY
    );
  };

  const uniforms = useDerivedValue(() => {
    return {
      size: [canvasWidth, canvasHeight],
      gesturePosition: [
        translate.x.value + canvasWidth / 2,
        translate.y.value + canvasHeight / 2,
      ],
      time: clock.value * 0.0008,
      scale: scale.value,
      waveIntensity: waveIntensity.value,
      progress: progress.value,
    };
  });

  const pan = Gesture.Pan()
    .onBegin((_) => {
      offset.x.value = translate.x.value;
      offset.y.value = translate.y.value;
    })
    .onChange((e) => {
      translate.x.value = offset.x.value + e.translationX;
      translate.y.value = offset.y.value + e.translationY;

      const inBounds = verifyInBoundsPosition();
      indicatorScale.value = withTiming(inBounds ? 1.15 : 1);
      waveIntensity.value = withTiming(inBounds ? 1 : 0, config);
      scale.value = withTiming(inBounds ? 0.8 : 1, config);
      progress.value = withTiming(inBounds ? 1 : 0, config);
    });

  const cursorAnimatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: translate.x.value },
      { translateY: translate.y.value },
      { scale: indicatorScale.value },
    ],
  }));

  const canvasStyle: ViewStyle = {
    width: canvasWidth,
    height: canvasHeight,
  };

  return (
    <View style={styles.root}>
      <View style={styles.borderWrapper}>
        <Canvas style={canvasStyle}>
          <Fill>
            <Shader source={shader} uniforms={uniforms}>
              <ImageShader
                image={greyScale}
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                fit={"cover"}
              />
              <ImageShader
                image={colorful}
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                fit={"cover"}
              />
            </Shader>
          </Fill>
        </Canvas>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.cursor, cursorAnimatedStyles]} />
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#151515",
  },
  borderWrapper: {
    borderRadius: 16,
    overflow: "hidden",
  },
  cursor: {
    width: CURSOR_SIZE,
    height: CURSOR_SIZE,
    borderRadius: CURSOR_SIZE / 2,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "transparent",
    position: "absolute",
  },
});

export default Index;
