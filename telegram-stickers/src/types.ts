import { type ImageSourcePropType } from "react-native";
import { type SkImage } from "@shopify/react-native-skia";

export type Vector<T> = {
  x: T;
  y: T;
};

export type SizeVector<T> = {
  width: T;
  height: T;
};

export type StickerState = {
  index: number;
  source: ImageSourcePropType;
  skiaSource: SkImage | null;
  radius: number;
  transform: {
    rotate: number;
    rotateY: number;
    translate: Vector<number>;
  };
};

export type StickerType = { id: string } & Pick<StickerState, "source"> &
  Partial<Omit<StickerState, "index">>;
