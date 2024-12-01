import { EventEmitter, EventSubscription } from "fbemitter";

const emitter = new EventEmitter();

const FLIP_EVENT = "flip";
export const listenToFlipEvent = (
  cb: (id: string) => void,
): EventSubscription => {
  return emitter.addListener(FLIP_EVENT, cb);
};

export const emitFlipEvent = (id: string) => {
  emitter.emit(FLIP_EVENT, id);
};
