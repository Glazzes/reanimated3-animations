import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Keyboard,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from "react-native";
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import Grid from "../grid/Grid";
import Gama from "../gama/Gama";
import Sliders from "../sliders/Sliders";
import OpacitySlider from "./slider/OpacitySlider";
import Controls from "./Controls";

import type { RGB } from "../utils/types";
import { SPACING } from "../utils/constants";
import { hsl2rgb } from "../utils/colors";
import { listenToOpenSheetEvent } from "../utils/emitter";
import { snapPoint } from "../utils/snapPoint";

const { width, height: screenHeight } = Dimensions.get("window");

const BottomSheet = () => {
  const [height, setHeight] = useState<number>(0);

  const translateY = useSharedValue<number>(0);
  const offsetY = useSharedValue<number>(0);
  const keyboardHeight = useSharedValue<number>(0);

  const color = useSharedValue<RGB>(hsl2rgb(180, 1, 0.5));
  const opacity = useSharedValue<number>(1);
  const activeSelector = useSharedValue<0 | 1 | 2>(0);
  const slidertranslateX = useSharedValue<number>(0);

  const measureBottomSheet = (e: LayoutChangeEvent) => {
    setHeight(e.nativeEvent.layout.height);
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      offsetY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateY.value = clamp(offsetY.value + e.translationY, -1 * height, 0);
    })
    .onEnd((e) => {
      const to = snapPoint(translateY.value, e.velocityY, [-1 * height, 0]);
      translateY.value = withTiming(to, undefined, () => {
        if (to === translateY.value) return;

        slidertranslateX.value = 0;
        activeSelector.value = 0;
      });
    });

  const bottomSheetStyles = useAnimatedStyle(() => ({
    transform: [
      { translateY: screenHeight },
      { translateY: translateY.value - keyboardHeight.value },
    ],
  }));

  const selectorStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: slidertranslateX.value }],
  }));

  useEffect(() => {
    const didShow = Keyboard.addListener("keyboardDidShow", (e) => {
      keyboardHeight.value = e.endCoordinates.height;
    });

    const didHide = Keyboard.addListener("keyboardDidHide", () => {
      keyboardHeight.value = 0;
    });

    return () => {
      didShow.remove();
      didHide.remove();
    };
  }, [keyboardHeight]);

  useEffect(() => {
    const sub = listenToOpenSheetEvent(() => {
      translateY.value = withTiming(-1 * height);
    });

    return () => {
      sub.remove();
    };
  }, [height, translateY]);

  return (
    <Animated.View
      onLayout={measureBottomSheet}
      style={[styles.root, bottomSheetStyles]}
    >
      <GestureDetector gesture={pan}>
        <Animated.View style={styles.dragable}>
          <View style={styles.knob} />
        </Animated.View>
      </GestureDetector>

      <Animated.View style={[styles.pickers, selectorStyles]}>
        <Grid color={color} activeSelector={activeSelector} />
        <Gama color={color} activeSelector={activeSelector} />
        <Sliders color={color} activeSelector={activeSelector} />
      </Animated.View>

      <OpacitySlider color={color} opacity={opacity} />

      <Controls
        color={color}
        opacity={opacity}
        activeSelector={activeSelector}
        selectorWidth={width}
        translateX={slidertranslateX}
        translateY={translateY}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: width,
    borderTopRightRadius: SPACING / 2,
    borderTopLeftRadius: SPACING / 2,
    backgroundColor: "#252525",
    position: "absolute",
  },
  dragable: {
    paddingTop: SPACING / 2,
    paddingBottom: SPACING,
    justifyContent: "center",
    alignItems: "center",
  },
  knob: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#5B5B5B",
  },
  pickers: {
    flexDirection: "row",
  },
});

export default React.memo(BottomSheet, () => true);
