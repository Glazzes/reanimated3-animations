import React, { useState } from "react";
import { TextInput, type KeyboardTypeOptions } from "react-native";
import Animated, {
  useAnimatedProps,
  type SharedValue,
} from "react-native-reanimated";

type AnimatedTextProps = {
  style: any[];
  value: SharedValue<string>;
  keyboardType: KeyboardTypeOptions;
  onChangeText: (
    text: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
  ) => void;
};

Animated.addWhitelistedNativeProps({ text: true });
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const AnimatedText: React.FC<AnimatedTextProps> = ({
  value,
  style,
  keyboardType,
  onChangeText,
}) => {
  const [textValue, setTextValue] = useState<string>(value.value);

  const animatedProps = useAnimatedProps(() => ({
    text: value.value,
  })) as any;

  return (
    <AnimatedTextInput
      style={style}
      value={textValue}
      onChangeText={(text) => onChangeText(text, setTextValue)}
      keyboardType={keyboardType}
      animatedProps={animatedProps}
    />
  );
};

export default AnimatedText;
