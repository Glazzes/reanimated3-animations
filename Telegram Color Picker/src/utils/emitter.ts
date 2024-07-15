import { EventEmitter, EventSubscription } from "fbemitter";

export const emitter = new EventEmitter();

export const OPEN_SHEET_EVENT = "open-sheet";
export const emitOpenSheetEvent = () => {
  emitter.emit(OPEN_SHEET_EVENT);
};

export const listenToOpenSheetEvent = (cb: () => void): EventSubscription => {
  return emitter.addListener(OPEN_SHEET_EVENT, cb);
};

export const OPEN_EYEDROPPER_EVENT = "open-eyedropper";
export const emitOpenEyedropperEvent = () => {
  emitter.emit(OPEN_EYEDROPPER_EVENT);
};

export const listenToOpenEyedropperEvent = (
  cb: () => void,
): EventSubscription => {
  return emitter.addListener(OPEN_EYEDROPPER_EVENT, cb);
};

export const SELECTED_COLOR_EVENT = "selected-color";
export const emitSelectedColorEvent = (color: string) => {
  emitter.emit(SELECTED_COLOR_EVENT, color);
};

export const listenToSelectedColorEvent = (
  cb: (color: string) => void,
): EventSubscription => {
  return emitter.addListener(SELECTED_COLOR_EVENT, cb);
};
