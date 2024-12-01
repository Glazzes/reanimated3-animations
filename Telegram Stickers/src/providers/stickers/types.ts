import { SharedValue } from "react-native-reanimated";

import { StickerState, StickerType, Vector } from "../../types";

export type StickerProviderType = {
  stickers: StickerType[];
  setStickers: React.Dispatch<React.SetStateAction<StickerType[]>>;
  activeStickerId: SharedValue<string | undefined>;
  stickerHistory: SharedValue<string[]>;
  stickerStateContext: SharedValue<Record<string, StickerState>>;
  blockStickerGestures: SharedValue<boolean>;
  openStickerMenu: (center: Vector<number>) => void;
};

export type StickerMenuType = {
  enter: (center: Vector<number>) => void;
  exit: (onFinishCallback?: () => void) => void;
};
