import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

type StickerPreviewProps = {
  source: number;
  addSticker: (source: number) => void;
};

const StickerPreview: React.FC<StickerPreviewProps> = ({
  source,
  addSticker,
}) => {
  const { width } = useWindowDimensions();
  const size = width / 4;
  const imageSize = size - (16 * 4) / 4;

  const onPress = () => {
    addSticker(source);
  };

  return (
    <Pressable
      onPress={onPress}
      style={[styles.root, { width: size, height: size }]}
    >
      <Image source={source} style={{ width: imageSize, height: imageSize }} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default React.memo(StickerPreview, (prev, next) => {
  return prev.source === next.source && prev.addSticker === next.addSticker;
});
