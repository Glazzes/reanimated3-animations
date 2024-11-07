import { SharedValue } from "react-native-reanimated";

import { StickerState, StickerType, Vector } from "../../types";

export type StickerProviderType = {
  stickers: StickerType[];
  setStickers: React.Dispatch<React.SetStateAction<StickerType[]>>;
  activeStickerIndex: SharedValue<number>;
  stickerHistory: SharedValue<number[]>;
  stickerStateContext: SharedValue<Record<number, StickerState>>;
  blockStickerGestures: SharedValue<boolean>;
  openStickerMenu: (center: Vector<number>) => void;
};

export type StickerMenuType = {
  enter: (center: Vector<number>) => void;
  exit: (onFinishCallback?: () => void) => void;
};
