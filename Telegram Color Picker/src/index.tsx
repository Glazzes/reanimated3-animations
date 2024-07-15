import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  View,
  StyleSheet,
  Text,
  Dimensions,
  Pressable,
} from "react-native";
import Animated, { ZoomIn, useAnimatedKeyboard } from "react-native-reanimated";
import { makeImageFromView, type SkImage } from "@shopify/react-native-skia";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import Constants from "expo-constants";

import BottomSheet from "./sheet/BottomSheet";
import EyeDropper from "./eyedropper/EyeDropper";
import {
  emitOpenSheetEvent,
  listenToOpenEyedropperEvent,
  listenToSelectedColorEvent,
} from "./utils/emitter";
import { SPACING } from "./utils/constants";
import { StatusBar } from "expo-status-bar";

const { width, height } = Dimensions.get("window");

const IMAGE = "https://avatars.githubusercontent.com/u/52082794?v=4";
const IMAGE_SIZE = width * 0.8;
const BARHEIGHT = Constants.statusBarHeight;

const selection: string[] = [];

const Index = () => {
  const ref = useRef<View>(null);

  // Using this disables Android automatic keyboard behaviour
  useAnimatedKeyboard();

  const [colors, setColors] = useState<string[]>(selection);
  const [image, setImage] = useState<SkImage | null>(null);

  const openSheet = () => {
    emitOpenSheetEvent();
  };

  useEffect(() => {
    const eyedropperSub = listenToOpenEyedropperEvent(() => {
      makeImageFromView(ref)
        .then((snapshot) => {
          setImage(snapshot);
        })
        .catch(() => console.log("no pictures :("));
    });

    const colorSub = listenToSelectedColorEvent((color) => {
      setColors((prev) => [...prev, color]);
    });

    return () => {
      eyedropperSub.remove();
      colorSub.remove();
    };
  }, [ref]);

  return (
    <View style={styles.root} ref={ref}>
      <View style={styles.frameContainer}>
        <View style={styles.appbar}>
          <Icon name="undo" size={24} color={"#fff"} />
          <Text style={styles.appbarText}>Borrar todo</Text>
        </View>

        <Image source={{ uri: IMAGE }} style={styles.image} />

        <View style={styles.selection}>
          {colors.map((color, index) => {
            return (
              <Animated.View
                key={`${color}-${index}`}
                entering={ZoomIn.duration(200)}
                style={[styles.color, { backgroundColor: color }]}
              />
            );
          })}

          <View style={{ flex: 1 }} />

          <Pressable onPress={openSheet}>
            <Icon name={"plus"} size={24} color={"#fff"} />
          </Pressable>
        </View>
      </View>

      <BottomSheet />
      {image !== null ? <EyeDropper image={image} setImage={setImage} /> : null}

      <StatusBar style="light" backgroundColor="#000" translucent={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width,
    height,
    backgroundColor: "#000000",
  },
  frameContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  appbar: {
    width: "100%",
    height: BARHEIGHT * 3,
    paddingHorizontal: SPACING,
    paddingTop: BARHEIGHT,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appbarText: {
    color: "#fff",
    fontWeight: "700",
  },
  selection: {
    width: IMAGE_SIZE,
    backgroundColor: "#1A1A1A",
    flexDirection: "row",
    borderRadius: SPACING / 2,
    padding: SPACING / 2,
    gap: SPACING / 2,
    marginBottom: SPACING,
  },
  color: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: SPACING / 2,
  },
});

export default Index;
