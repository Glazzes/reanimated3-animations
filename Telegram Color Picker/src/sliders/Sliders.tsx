import React, { useEffect } from "react";
import { View, StyleSheet, Text, Keyboard } from "react-native";
import {
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";

import AnimatedText from "./AnimatedText";
import ChannelSlider from "./ChannelSlider";

import type { RGB } from "../utils/types";
import { hex2rgb, rgb2hex } from "./utils";
import {
  GRID_CELL_SIZE,
  PICKER_HEIGHT,
  PICKER_WIDTH,
  SPACING,
} from "../utils/constants";

type SlidersProps = {
  color: SharedValue<RGB>;
  activeSelector: SharedValue<0 | 1 | 2>;
};

const Sliders: React.FC<SlidersProps> = ({ color, activeSelector }) => {
  const isEditing = useSharedValue<boolean>(false);

  // Color memoization for increase performance (+30 fps)
  const lastHexColor = useSharedValue<string>(rgb2hex(color.value));
  const hexColor = useDerivedValue<string>(() => {
    if (activeSelector.value !== 2 || isEditing.value) {
      return lastHexColor.value;
    }

    lastHexColor.value = rgb2hex(color.value);
    return lastHexColor.value;
  });

  const onChangeText = (text: string, setValue) => {
    isEditing.value = true;
    const trimmedText = text.substring(0, 6);

    setValue(trimmedText);
    const rgbColor = hex2rgb(text);
    if (rgbColor !== undefined) {
      color.value = rgbColor;
      lastHexColor.value = trimmedText;
    }
  };

  useEffect(() => {
    const listener = Keyboard.addListener("keyboardDidHide", () => {
      isEditing.value = false;
    });

    return () => {
      listener.remove();
    };
  }, [isEditing]);

  return (
    <View style={styles.root}>
      <ChannelSlider
        color={color}
        colorName={"ROJO"}
        activeChannel="r"
        activeSelector={activeSelector}
      />
      <ChannelSlider
        color={color}
        colorName={"VERDE"}
        activeChannel="g"
        activeSelector={activeSelector}
      />
      <ChannelSlider
        color={color}
        colorName={"AZUL"}
        activeChannel="b"
        activeSelector={activeSelector}
      />

      <View style={styles.hexContainer}>
        <Text style={styles.title}>COLOR HEXADECIMAL #</Text>
        <AnimatedText
          value={hexColor}
          style={[styles.input]}
          keyboardType="default"
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: PICKER_WIDTH + SPACING * 2,
    borderRadius: SPACING / 2,
    gap: SPACING,
  },
  canvas: {
    width: PICKER_WIDTH,
    height: PICKER_HEIGHT,
    backgroundColor: "orange",
    borderRadius: SPACING / 2,
  },
  hexContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING,
    justifyContent: "flex-end",
    alignItems: "center",
    gap: SPACING,
  },
  title: {
    color: "#A8A8A8",
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    backgroundColor: "#5B5B5B",
    borderRadius: SPACING / 4,
    textAlign: "center",
    width: PICKER_WIDTH - PICKER_WIDTH * 0.75 - SPACING,
    height: GRID_CELL_SIZE * 1.2,
  },
});

export default Sliders;
