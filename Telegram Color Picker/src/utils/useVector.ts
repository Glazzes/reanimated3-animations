import { useSharedValue } from "react-native-reanimated";

export const useVector = (x: number, y?: number) => {
  const x1 = useSharedValue<number>(x);
  const y1 = useSharedValue<number>(y ?? x);

  return { x: x1, y: y1 };
};
