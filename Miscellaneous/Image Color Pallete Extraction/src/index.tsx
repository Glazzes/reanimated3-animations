import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Button,
  Image,
  Text,
  PixelRatio,
} from "react-native";
import {
  AlphaType,
  ColorType,
  useImage,
  Skia,
  rect,
  FilterMode,
  MipmapMode,
} from "@shopify/react-native-skia";
import {
  launchImageLibraryAsync,
  useMediaLibraryPermissions,
} from "expo-image-picker";

import { getDominantColor, getPallete } from "./utils/colors";

type SizeVector = { width: number; height: number };
const calculateImageSize = (width: number, size: SizeVector): SizeVector => {
  const aspectRatio = size.width / size.height;
  const height = width / aspectRatio;

  return { width, height };
};

const orange =
  "https://i.pinimg.com/originals/84/73/c9/8473c9193608e5ff43bd2ee65de56c6e.png";

const PalleteExtractor = () => {
  const [status, requestPermission] = useMediaLibraryPermissions();

  const [uri, setUri] = useState<string | null>(orange);
  const image = useImage(uri);

  const [colors, setColors] = useState<string[]>([]);
  const [dominantColor, setDominantColor] = useState<string | undefined>(
    undefined,
  );

  const [imageSize, setImageSize] = useState<SizeVector>({
    width: 200,
    height: 200,
  });

  const openPicker = () => {
    launchImageLibraryAsync()
      .then((result) => {
        const asset = result.assets![0];
        setUri(asset.uri);

        const size = calculateImageSize(200, {
          width: asset.width,
          height: asset.height,
        });
        setImageSize(size);
      })
      .catch(() => console.log("no assets"));
  };

  const readPallete = async () => {
    if (image === null) return;

    const size = calculateImageSize(100, imageSize);
    size.width = PixelRatio.getPixelSizeForLayoutSize(size.width);
    size.height = PixelRatio.getPixelSizeForLayoutSize(size.height);

    const offscreen = Skia.Surface.MakeOffscreen(size.width, size.height)!;
    const canvas = offscreen?.getCanvas();
    canvas?.drawImageRectOptions(
      image,
      rect(0, 0, image.width(), image.height()),
      rect(0, 0, size.width, size.height),
      FilterMode.Linear,
      MipmapMode.Linear,
    );
    offscreen.flush();

    const offImage = offscreen.makeImageSnapshot();

    const pixels = offImage.readPixels(0, 0, {
      colorType: ColorType.RGBA_F32,
      alphaType: AlphaType.Premul,
      width: size.width,
      height: size.height,
    });

    const pallete = getPallete(pixels as unknown as number[], 10);
    const dominant = getDominantColor(pixels as unknown as number[], 10);

    pallete && setColors(pallete);
    dominant && setDominantColor(dominant);
  };

  useEffect(() => {
    requestPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (image !== null) {
      readPallete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  if (!status?.granted) {
    return null;
  }

  return (
    <View style={[styles.root, styles.center]}>
      <Button title="open picker" onPress={openPicker} />

      {uri && (
        <Image source={{ uri }} style={{ ...imageSize, borderRadius: 16 }} />
      )}

      {dominantColor && (
        <View style={styles.center}>
          <Text style={styles.title}>Dominant color</Text>
          <View style={[styles.color, { backgroundColor: dominantColor }]} />
        </View>
      )}

      {colors.length !== 0 && (
        <View style={styles.center}>
          <Text style={styles.title}>Pallete</Text>
          <View style={styles.colorcontainer}>
            {colors.map((color, index) => {
              return (
                <View
                  key={`${color}-${index}`}
                  style={[styles.color, { backgroundColor: color }]}
                />
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  root: {
    flex: 1,
    gap: 16,
  },
  title: {
    color: "#2e2e2e",
    fontWeight: "700",
  },
  colorcontainer: {
    width: 200,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 8,
  },
  color: {
    width: 30,
    height: 30,
    borderRadius: 8,
  },
});

export default PalleteExtractor;
