import React from "react";
import { StyleSheet, TextInput, type TextInputProps } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedProps,
} from "react-native-reanimated";
import { MEDIUM_FONT } from "../constants/constants";

Animated.addWhitelistedNativeProps({ text: true });

interface TextProps extends Omit<TextInputProps, "value" | "style"> {
  text: SharedValue<string>;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const ReText = (props: TextProps) => {
  const { text, ...rest } = props;
  const animatedProps = useAnimatedProps(() => {
    return {
      text: text.value,
      // Here we use any because the text prop is not available in the type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  });
  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      value={text.value}
      style={styles.baseStyle}
      {...rest}
      {...{ animatedProps }}
    />
  );
};

const styles = StyleSheet.create({
  baseStyle: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12.5,
    fontFamily: MEDIUM_FONT,
  },
});

export default ReText;
