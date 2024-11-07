import { SharedValue, useSharedValue } from "react-native-reanimated";
import { Vector } from "../../types";

export const useVector = (
  x: number,
  y?: number,
): Vector<SharedValue<number>> => {
  const x1 = useSharedValue<number>(x);
  const y1 = useSharedValue<number>(y ?? x);

  return { x: x1, y: y1 };
};
