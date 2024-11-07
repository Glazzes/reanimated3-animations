import React, { useContext } from "react";
import {
  Image,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";

import Sticker from "@components/Sticker";
import { StickerContext } from "@providers/index";
import { SkImage } from "@shopify/react-native-skia";
import { SizeVector } from "../types";

type EditableImageProps = {
  image: SkImage;
  screenDimensions: SizeVector<number>;
};

const EditableImage: React.FC<EditableImageProps> = ({
  image,
  screenDimensions,
}) => {
  const { stickers } = useContext(StickerContext);

  const style: ViewStyle = {
    width: screenDimensions.width,
    height: screenDimensions.height,
    overflow: "hidden",
  };

  return (
    <View style={[styles.root, styles.center]}>
      <View style={[style, styles.center]}>
        <Image
          source={require("../../assets/dalmatian.webp")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />

        {stickers.map((sticker, index) => {
          return <Sticker key={sticker.id} index={index} sticker={sticker} />;
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EditableImage;
