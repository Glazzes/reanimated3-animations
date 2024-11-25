import React, { createContext, useRef, useState } from "react";
import {
  runOnUI,
  useAnimatedReaction,
  useSharedValue,
} from "react-native-reanimated";
import { randomUUID } from "expo-crypto";

import { emitFlipEvent } from "@utils/emitter";

import StickerOptionsMenu from "./menu/StickerOptionsMenu";

import { StickerMenuType, StickerProviderType } from "./types";
import { StickerType, StickerState, Vector } from "../../types";

export const StickerContext = createContext<StickerProviderType>(
  {} as StickerProviderType,
);

type StickerProviderProps = React.PropsWithChildren<{}>;

const StickerProvider = ({ children }: StickerProviderProps) => {
  const menuRef = useRef<StickerMenuType>(null);

  const [stickers, setStickers] = useState<StickerType[]>([]);

  const activeStickerIndex = useSharedValue<number>(0);
  const stickerHistory = useSharedValue<number[]>([]); // order in which the stickers are pressed
  const stickerStateContext = useSharedValue<Record<number, StickerState>>({});
  const blockStickerGestures = useSharedValue<boolean>(false);

  const openStickerMenu = (center: Vector<number>) => {
    blockStickerGestures.value = true;
    menuRef.current?.enter(center);
  };

  const flip = () => {
    menuRef.current?.exit(() => {
      blockStickerGestures.value = false;
      emitFlipEvent(activeStickerIndex.value);
    });
  };

  const duplicate = () => {
    const actualSticker = stickerStateContext.value[activeStickerIndex.value];

    const id = randomUUID();
    const newSticker: StickerType = {
      id,
      source: actualSticker.source,
      skiaSource: actualSticker.skiaSource,
      radius: actualSticker.radius,
      transform: {
        rotate: actualSticker.transform.rotate,
        rotateY: actualSticker.transform.rotateY,
        translate: {
          x: actualSticker.transform.translate.x + 30,
          y: actualSticker.transform.translate.y + 30,
        },
      },
    };

    menuRef.current?.exit(() => {
      runOnUI(() => {
        "worklet";

        blockStickerGestures.value = false;
        stickerHistory.value = [...stickerHistory.value, stickers.length];
        activeStickerIndex.value = stickers.length;
      })();

      setStickers((prev) => [...prev, newSticker]);
    });
  };

  const deleteSticker = () => {
    menuRef.current?.exit(() => {
      const deletedIndex = activeStickerIndex.value;
      setStickers((prev) => prev.filter((_, index) => index !== deletedIndex));

      runOnUI(() => {
        "worklet";

        const newHistory: number[] = [];
        const newState: Record<number, StickerState> = {};
        for (let i = 0; i < stickerHistory.value.length - 1; i++) {
          const currentIndex = stickerHistory.value[i];
          const newIndex = currentIndex - (currentIndex > deletedIndex ? 1 : 0);

          newHistory[i] = newIndex;
          newState[newIndex] = stickerStateContext.value[currentIndex];
        }

        blockStickerGestures.value = false;
        stickerHistory.value = newHistory;
        stickerStateContext.value = newState;
        activeStickerIndex.value = newHistory[newHistory.length - 1];
      })();
    });
  };

  useAnimatedReaction(
    () => activeStickerIndex.value,
    (value) => {
      const newHistory: number[] = [];
      const activeStickerHistoryIndex = stickerHistory.value.indexOf(value);

      for (let i = 0; i < stickerHistory.value.length; i++) {
        if (i === activeStickerHistoryIndex) {
          newHistory[stickerHistory.value.length - 1] = value;
          continue;
        }

        const index = i < activeStickerHistoryIndex ? i : i - 1;
        newHistory[index] = stickerHistory.value[i];
      }

      stickerHistory.value = newHistory;
    },
    [activeStickerIndex],
  );

  return (
    <StickerContext.Provider
      value={{
        stickers,
        setStickers,
        activeStickerIndex,
        stickerHistory,
        stickerStateContext,
        blockStickerGestures,
        openStickerMenu,
      }}
    >
      {children}

      <StickerOptionsMenu ref={menuRef}>
        <StickerOptionsMenu.Item title="flip" onPress={flip} />
        <StickerOptionsMenu.Item title="duplicate" onPress={duplicate} />
        <StickerOptionsMenu.Item title="delete" onPress={deleteSticker} />
      </StickerOptionsMenu>
    </StickerContext.Provider>
  );
};

export default StickerProvider;
