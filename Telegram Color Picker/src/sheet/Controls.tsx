import React from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  Keyboard,
  type LayoutChangeEvent,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

import { SPACING } from "../utils/constants";
import {
  emitOpenEyedropperEvent,
  emitSelectedColorEvent,
} from "../utils/emitter";
import type { RGB } from "../utils/types";

type ControlsProps = {
  selectorWidth: number;
  color: SharedValue<RGB>;
  opacity: SharedValue<number>;
  activeSelector: SharedValue<0 | 1 | 2>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
};

type TextInfo = {
  width: number;
  x: number;
};

const INDICATOR_SIZE = 5;

const Controls: React.FC<ControlsProps> = ({
  color,
  opacity,
  activeSelector,
  translateX,
  translateY,
  selectorWidth,
}) => {
  const indicatorTranslateX = useSharedValue<number>(0);
  const x = useSharedValue<number>(0);
  const y = useSharedValue<number>(0);

  const textWidth = useSharedValue<number>(0);
  const gridText = useSharedValue<TextInfo>({ width: 0, x: 0 });
  const gammaText = useSharedValue<TextInfo>({ width: 0, x: 0 });
  const sliderText = useSharedValue<TextInfo>({ width: 0, x: 0 });

  const mesaureText = (e: LayoutChangeEvent, index: number) => {
    const { width, height, x: posX, y: posY } = e.nativeEvent.layout;

    if (index === 0) {
      textWidth.value = width;
      x.value = posX;
      y.value = posY + height + SPACING / 4;

      gridText.value = { width, x: posX };
    }

    if (index === 1) gammaText.value = { width, x: posX };
    if (index === 2) sliderText.value = { width, x: posX };
  };

  const animateIndicatorTransition = (index: number) => {
    let toX = 0;
    let tWidth = gridText.value.width;
    if (index === 1) {
      toX = gammaText.value.x - x.value;
      tWidth = gammaText.value.width;
    }

    if (index === 2) {
      toX = sliderText.value.x - x.value;
      tWidth = sliderText.value.width;
    }

    console.log(toX, gammaText.value.x, x.value);
    indicatorTranslateX.value = withTiming(toX);
    textWidth.value = withTiming(tWidth);
  };

  const onSelectorPress = (index: number) => {
    activeSelector.value = index as 0 | 1 | 2;
    translateX.value = withTiming(-1 * index * selectorWidth);
    animateIndicatorTransition(index);
  };

  const openEyeDropper = () => {
    translateY.value = withTiming(0, undefined, () => {
      translateX.value = 0;
      activeSelector.value = 0;

      runOnJS(emitOpenEyedropperEvent)();
    });
  };

  const selectColor = () => {
    const [r, g, b] = color.value;
    const newColor = `rgba(${r}, ${g}, ${b}, ${opacity.value})`;

    Keyboard.dismiss();
    translateY.value = withTiming(0, undefined, () => {
      translateX.value = 0;
      activeSelector.value = 0;
      indicatorTranslateX.value = 0;
      textWidth.value = gridText.value.width;

      runOnJS(emitSelectedColorEvent)(newColor);
    });
  };

  const inidicatorStyles = useAnimatedStyle(() => {
    return {
      width: textWidth.value,
      top: y.value,
      left: x.value,
      transform: [{ translateX: indicatorTranslateX.value }],
    };
  });

  return (
    <View style={styles.root}>
      <Pressable onPress={openEyeDropper}>
        <Icon name="eyedropper" size={24} color={"#fff"} />
      </Pressable>

      <Pressable
        hitSlop={7}
        onLayout={(e) => mesaureText(e, 0)}
        onPress={() => onSelectorPress(0)}
      >
        <Text style={styles.text}>GRID</Text>
      </Pressable>

      <Pressable
        hitSlop={7}
        onLayout={(e) => mesaureText(e, 1)}
        onPress={() => onSelectorPress(1)}
      >
        <Text style={styles.text}>GAMA</Text>
      </Pressable>

      <Pressable
        hitSlop={7}
        onLayout={(e) => mesaureText(e, 2)}
        onPress={() => onSelectorPress(2)}
      >
        <Text style={styles.text}>SLIDERS</Text>
      </Pressable>

      <Pressable onPress={selectColor}>
        <Icon name="check" size={24} color={"#fff"} />
      </Pressable>

      <Animated.View style={[styles.indicator, inidicatorStyles]} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING,
  },
  text: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  indicator: {
    height: INDICATOR_SIZE,
    backgroundColor: "#fff",
    borderTopRightRadius: INDICATOR_SIZE / 2,
    borderTopLeftRadius: INDICATOR_SIZE / 2,
    position: "absolute",
    alignSelf: "center",
  },
});

export default Controls;
