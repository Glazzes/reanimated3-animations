import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";

import Icon from "@expo/vector-icons/MaterialCommunityIcons";

import { BOLD_FONT, GAP, ICON_SIZE, MEDIUM_FONT } from "./constants/constants";

import { lyrics } from "./constants/lyrics";

const COLOR = "#fff";

const statusBarHeight = Constants.statusBarHeight;

const Appbar = () => {
  return (
    <View style={styles.root}>
      <Icon
        name="chevron-down"
        color={COLOR}
        size={ICON_SIZE + 4}
        style={styles.chevron}
      />

      <View style={styles.trackContainer}>
        <Text style={styles.title}>{lyrics.name}</Text>
        <Text style={styles.artist}>{lyrics.artist}</Text>
      </View>

      <Icon name="flag-triangle" color={COLOR} size={ICON_SIZE + 4} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: "100%",
    height: statusBarHeight * 4.5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: statusBarHeight,
    paddingHorizontal: GAP,
  },
  chevron: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 14,
  },
  trackContainer: {
    alignItems: "center",
  },
  title: {
    fontFamily: BOLD_FONT,
    color: COLOR,
  },
  artist: {
    fontSize: 15,
    fontFamily: MEDIUM_FONT,
    color: COLOR,
  },
});

export default Appbar;
