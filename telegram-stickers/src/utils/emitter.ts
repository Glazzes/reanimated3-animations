import { EventEmitter, EventSubscription } from "fbemitter";

const emitter = new EventEmitter();

const FLIP_EVENT = "flip";
export const listenToFlipEvent = (
  cb: (index: number) => void,
): EventSubscription => {
  return emitter.addListener(FLIP_EVENT, cb);
};

export const emitFlipEvent = (index: number) => {
  emitter.emit(FLIP_EVENT, index);
};
