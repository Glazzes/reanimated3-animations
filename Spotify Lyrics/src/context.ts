import { createContext, useContext } from "react";
import { SharedValue } from "react-native-reanimated";

import { Size, ScrollPositions } from "./types";

type LyricsContextType = {
  width: number;
  height: number;
  setWidth: React.Dispatch<React.SetStateAction<number>>;
  setHeight: React.Dispatch<React.SetStateAction<number>>;
  activeLyric: SharedValue<number>;
  translate: SharedValue<number>;
  playbackTime: SharedValue<number>;
  baseListSize: SharedValue<number>;
  translatedListSize: SharedValue<number>;
  translationProgress: SharedValue<number>;
  lyricSizes: SharedValue<Size[]>;
  scrollPositions: SharedValue<ScrollPositions>;
  isSeeking: SharedValue<boolean>;
};

export const LyricsContext = createContext<LyricsContextType>(
  {} as LyricsContextType,
);

export const useLyricsContext = (): LyricsContextType => {
  const context = useContext(LyricsContext);

  if (!context) {
    throw new Error("LyricsContext was used out of its respective provider");
  }

  return context;
};
