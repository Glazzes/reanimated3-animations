import { EventEmitter, type EventSubscription } from 'fbemitter';
import { type SkImage } from '@shopify/react-native-skia';

export type PatternChangeOptions = {
  index: number;
  accentColor: string;
  patternImage: SkImage;
};

const emitter = new EventEmitter();

const PATTERN_CHANGE_EVENT = 'change_pattern_event';
export const listenToPatternChangeEvent = (
  callback: (options: PatternChangeOptions) => void
): EventSubscription => {
  return emitter.addListener(PATTERN_CHANGE_EVENT, callback);
};

export const emitPatternChangeEvent = (options: PatternChangeOptions): void => {
  emitter.emit(PATTERN_CHANGE_EVENT, options);
};

const THEME_CHANGE_EVENT = 'theme_change_event';

export type ThemeChangeOptions = {
  x: number;
  y: number;
  raidus: number;
};

export const listenTothemeChangeEvent = (
  callback: (options: ThemeChangeOptions) => void
): EventSubscription => {
  return emitter.addListener(THEME_CHANGE_EVENT, callback);
};

export const emitThemeChangeEvent = (options: ThemeChangeOptions): void => {
  emitter.emit(THEME_CHANGE_EVENT, options);
};
