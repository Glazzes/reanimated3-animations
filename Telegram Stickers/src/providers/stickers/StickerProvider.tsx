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

  const activeStickerId = useSharedValue<string | undefined>(undefined);
  const stickerHistory = useSharedValue<string[]>([]);
  const stickerStateContext = useSharedValue<Record<string, StickerState>>({});
  const blockStickerGestures = useSharedValue<boolean>(false);

  const openStickerMenu = (center: Vector<number>) => {
    blockStickerGestures.value = true;
    menuRef.current?.enter(center);
  };

  const flip = () => {
    menuRef.current?.exit(() => {
      blockStickerGestures.value = false;

      const currentId = activeStickerId.get();
      if (currentId !== undefined) {
        emitFlipEvent(currentId);
      }
    });
  };

  const duplicate = () => {
    const currentId = activeStickerId.value;
    if (currentId === undefined) return;

    const actualSticker = stickerStateContext.value[currentId];
    if (actualSticker === undefined) return;

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

        activeStickerId.value = id;
        stickerHistory.modify((current) => {
          "worklet";
          current.push(id);
          return current;
        });
      })();

      setStickers((prev) => [...prev, newSticker]);
    });
  };

  const deleteSticker = () => {
    menuRef.current?.exit(() => {
      const activeId = activeStickerId.value;
      if (activeId === undefined) return;

      setStickers((prev) => prev.filter((sticker) => sticker.id !== activeId));

      runOnUI(() => {
        "worklet";

        const historyLength = stickerHistory.value.length;
        blockStickerGestures.value = false;
        activeStickerId.value = stickerHistory.value[historyLength - 2];

        // @ts-ignore
        stickerHistory.modify((current) => {
          "worklet";
          return current.filter((id) => id !== activeId);
        });

        stickerStateContext.modify((current) => {
          "worklet";
          delete current[activeId];
          return current;
        });
      })();
    });
  };

  useAnimatedReaction(
    () => activeStickerId.value,
    (value) => {
      if (value === undefined) return;

      // @ts-ignore
      stickerHistory.modify((prev) => {
        "worklet";

        const newHistory = prev.filter((id: string) => id !== value);
        newHistory.push(value);
        return newHistory;
      });
    },
    [activeStickerId],
  );

  return (
    <StickerContext.Provider
      value={{
        stickers,
        setStickers,
        activeStickerId,
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
