import { SharedValue, useSharedValue } from "react-native-reanimated";
import { SizeVector } from "../types";

export const useSizeVector = (
  x: number,
  y?: number,
): SizeVector<SharedValue<number>> => {
  const width = useSharedValue<number>(x);
  const height = useSharedValue<number>(y ?? x);

  return { width, height };
};
