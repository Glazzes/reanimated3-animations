import React, {
  forwardRef,
  ForwardRefExoticComponent,
  RefAttributes,
  useImperativeHandle,
  useState,
} from "react";
import {
  Dimensions,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import Animated, {
  clamp,
  FadeInUp,
  FadeOutDown,
  runOnJS,
  runOnUI,
  useAnimatedStyle,
} from "react-native-reanimated";

import { useSizeVector, useVector } from "@utils/index";

import { Vector } from "../../../types";
import { StickerMenuType } from "../types";

type StickerOptionsMenuItemProps = {
  title: string;
  onPress: () => void;
};

const StickerOptionsMenuItem = (props: StickerOptionsMenuItemProps) => {
  return (
    <Pressable onPress={props.onPress}>
      <Text style={itemStyles.title}>{props.title}</Text>
    </Pressable>
  );
};

const itemStyles = StyleSheet.create({
  title: {
    textTransform: "uppercase",
    color: "#fff",
    fontWeight: "700",
  },
});

type ComponentType = ForwardRefExoticComponent<
  StickerOptionsMenuProps & RefAttributes<StickerMenuType>
> & { Item: typeof StickerOptionsMenuItem };

type StickerOptionsMenuProps = React.PropsWithChildren<{}>;

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const initialPosition = -1 * Math.max(screenWidth, screenWidth);

const StickerOptionsMenu = forwardRef<StickerMenuType, StickerOptionsMenuProps>(
  (props, ref) => {
    const [isOpen, setIsOpen] = useState<boolean>(true);

    const menuSize = useSizeVector(0, 0);
    const position = useVector(initialPosition);

    const onLayout = (e: LayoutChangeEvent) => {
      if (menuSize.width.value === 0 || menuSize.height.value === 0) {
        menuSize.width.value = e.nativeEvent.layout.width;
        menuSize.height.value = e.nativeEvent.layout.height;
        setIsOpen(false);
      }
    };

    const enter = (center: Vector<number>) => {
      const lower = 0;
      const boundX = screenWidth - menuSize.width.value;
      const boundY = screenHeight - menuSize.height.value;

      const menuPosX = center.x - menuSize.width.value / 2;
      const menuPosY = center.y - menuSize.height.value;

      runOnUI(() => {
        "worklet";

        position.x.value = clamp(menuPosX, lower, boundX);
        position.y.value = clamp(menuPosY, lower, boundY);

        runOnJS(setIsOpen)(true);
      })();
    };

    const exit = (callback?: () => void) => {
      callback?.();
      setIsOpen(false);
    };

    const animatedStyles = useAnimatedStyle(
      () => ({
        position: "absolute",
        top: position.y.value,
        left: position.x.value,
      }),
      [position],
    );

    useImperativeHandle(ref, () => ({ enter, exit }));

    if (!isOpen) return null;

    return (
      <Animated.View
        entering={FadeInUp.duration(200)}
        exiting={FadeOutDown.duration(200)}
        style={[styles.menu, animatedStyles]}
        onLayout={onLayout}
      >
        {props.children}
      </Animated.View>
    );
  },
) as ComponentType;

StickerOptionsMenu.displayName = "StickerOptionsMenu";
StickerOptionsMenu.Item = StickerOptionsMenuItem;

const styles = StyleSheet.create({
  menu: {
    flexDirection: "row",
    gap: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#1e1e1e",
  },
});

export default StickerOptionsMenu;
