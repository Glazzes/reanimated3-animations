import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  clamp,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  AlphaType,
  Canvas,
  ColorType,
  Fill,
  Image,
  ImageShader,
  Shader,
  Skia,
  type SkImage,
} from "@shopify/react-native-skia";

import { EYE_DROPPER_SHADER } from "./utils";
import { useVector } from "../utils/useVector";
import { emitSelectedColorEvent } from "../utils/emitter";

type EyeDropperProps = {
  image: SkImage;
  setImage: React.Dispatch<React.SetStateAction<SkImage | null>>;
};

const SHADER = Skia.RuntimeEffect.Make(EYE_DROPPER_SHADER)!;

const { width, height } = Dimensions.get("window");

const SIZE = width * 0.45;

const EyeDropper: React.FC<EyeDropperProps> = ({ image, setImage }) => {
  const translate = useVector(0, 0);
  const offset = useVector(0, 0);
  const scale = useSharedValue<number>(0);

  const onEnd = () => {
    const resizerX = image.width() / width;
    const resizerY = image.height() / height;
    const x = (width / 2 + translate.x.value) * resizerX;
    const y = (height / 2 + translate.y.value) * resizerY;

    const pixels = image.readPixels(x, y, {
      colorType: ColorType.RGBA_F32,
      alphaType: AlphaType.Premul,
      height: 1,
      width: 1,
    });

    if (pixels === null) return;

    const r = clamp(Math.round(pixels[0]! * 255), 0, 255);
    const g = clamp(Math.round(pixels[1]! * 255), 0, 255);
    const b = clamp(Math.round(pixels[2]! * 255), 0, 255);
    emitSelectedColorEvent(`rgba(${r}, ${g}, ${b}, 1)`);

    translate.x.value = 0;
    translate.y.value = 0;
    setImage(null);
  };

  const uniforms = useDerivedValue(() => {
    return {
      size: [SIZE, SIZE],
      nestedSize: [width, height],
      gesturePos: [
        width / 2 + translate.x.value,
        height / 2 + translate.y.value,
      ],
    };
  });

  const pan = Gesture.Pan()
    .onStart((e) => {
      offset.x.value = e.x - width / 2;
      offset.y.value = e.y - height / 2;
    })
    .onUpdate((e) => {
      translate.x.value = offset.x.value + e.translationX;
      translate.y.value = offset.y.value + e.translationY;
    })
    .onEnd(() => {
      scale.value = withTiming(0, undefined, () => {
        runOnJS(onEnd)();
      });
    });

  const selectorStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: translate.x.value },
      { translateY: translate.y.value },
      { scale: scale.value },
    ],
  }));

  useEffect(() => {
    scale.value = withTiming(1);
  }, [scale]);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={styles.root}>
        <Canvas style={styles.backgroundCanvas}>
          <Image
            image={image}
            x={0}
            y={0}
            width={width}
            height={height}
            fit={"cover"}
          />
        </Canvas>

        <Animated.View style={[styles.container, selectorStyles]}>
          <Canvas style={styles.container}>
            <Fill>
              <Shader source={SHADER} uniforms={uniforms}>
                {image && (
                  <ImageShader
                    image={image}
                    fit={"cover"}
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                  />
                )}
              </Shader>
            </Fill>
          </Canvas>

          <View style={styles.indicator} />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  root: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  backgroundCanvas: {
    width,
    height,
    position: "absolute",
  },
  container: {
    width: SIZE,
    height: SIZE,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  indicator: {
    width: SIZE / 11 + 2,
    height: SIZE / 11 + 2,
    borderWidth: 3,
    borderColor: "#fff",
    position: "absolute",
  },
});

export default EyeDropper;
