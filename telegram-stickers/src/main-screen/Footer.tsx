import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { SkImage } from "@shopify/react-native-skia";
import { randomUUID } from "expo-crypto";
import Constats from "expo-constants";

import {
  convertImageAndStickersToBase64,
  saveBase64ImageToGallery,
} from "@utils/index";
import { BottomSheetContext, StickerContext } from "@providers/index";
import { INITIAL_STICKER_SIZE } from "@constants/constants";
import { SizeVector } from "../types";

const statusBarHeight = Constats.statusBarHeight;

type FooterProps = {
  image: SkImage;
  screenDimensions: SizeVector<number>;
};

const Footer: React.FC<FooterProps> = ({ image, screenDimensions }) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { open } = useContext(BottomSheetContext);
  const { stickerHistory, stickerStateContext } = useContext(StickerContext);

  const openBottomSheet = () => {
    open();
  };

  const saveImageAsync = () =>
    new Promise((resolve, reject) => {
      if (image === null) {
        reject(undefined);
        return;
      }

      const base64 = convertImageAndStickersToBase64({
        image,
        imageSize: screenDimensions,
        history: stickerHistory.value,
        stickerContext: stickerStateContext.value,
        stickerSize: INITIAL_STICKER_SIZE,
      });

      if (base64 === undefined) {
        reject(undefined);
        return;
      }

      const uuid = randomUUID();
      const imageName = `${uuid}.png`;

      saveBase64ImageToGallery(base64, imageName, "Sticker App Test").then(() =>
        resolve(undefined),
      );
    });

  const saveImageToDisk = () => {
    setIsSaving(true);
    saveImageAsync().finally(() => setIsSaving(false));
  };

  return (
    <View style={styles.container}>
      <Icon name={"close"} color={"#fff"} size={24} />
      <Text style={styles.text}>Draw</Text>

      <Pressable onPress={openBottomSheet}>
        <Text style={styles.text}>Sticker</Text>
      </Pressable>

      <Text style={styles.text}>Text</Text>

      {isSaving ? (
        <ActivityIndicator color={"#fff"} size={"small"} />
      ) : (
        <Pressable onPress={saveImageToDisk}>
          <Icon name={"check"} color={"#fff"} size={24} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: statusBarHeight * 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  text: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});

export default Footer;
