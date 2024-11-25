import React, { useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Constants from "expo-constants";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { StickerContext } from "@providers/index";
import { runOnUI } from "react-native-reanimated";

const statusBarHeight = Constants.statusBarHeight;
const activeColor = "#fff";
const inactiveColor = "#999999";

export const Header = () => {
  const { stickers, setStickers, activeStickerIndex, stickerHistory } =
    useContext(StickerContext);
  const color = stickers.length > 0 ? activeColor : inactiveColor;

  const undo = () => {
    if (stickers.length === 0) return;

    const lastIndex = stickers.length - 1;
    setStickers((prev) => prev.filter((_, index) => index !== lastIndex));

    runOnUI(() => {
      "worklet";
      stickerHistory.value = stickerHistory.value.filter(
        (value) => value !== lastIndex,
      );
      activeStickerIndex.value = stickerHistory.value[lastIndex - 1] ?? 0;
    })();
  };

  const clearStickers = () => {
    setStickers([]);
    activeStickerIndex.value = 0;
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={undo}>
        <Icon name="undo-variant" color={color} size={24} />
      </Pressable>
      <Pressable onPress={clearStickers}>
        <Text style={[styles.text, { color }]}>Clear All</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: statusBarHeight * 3,
    paddingTop: statusBarHeight,
  },
  text: {
    fontWeight: "700",
    fontSize: 15,
  },
});

export default Header;
