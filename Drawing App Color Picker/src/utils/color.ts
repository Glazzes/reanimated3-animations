import { clamp } from "react-native-reanimated";

export const hsl2rgb = (
  h: number,
  s: number,
  l: number,
): [number, number, number] => {
  "worklet";
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const huePrime = h / 60;
  const x = c * (1 - Math.abs((huePrime % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (huePrime >= 0 && huePrime < 1) {
    r = c;
    g = x;
    b = 0;
  }

  if (huePrime >= 1 && huePrime < 2) {
    r = x;
    g = c;
    b = 0;
  }

  if (huePrime >= 2 && huePrime < 3) {
    r = 0;
    g = c;
    b = x;
  }

  if (huePrime >= 3 && huePrime < 4) {
    r = 0;
    g = x;
    b = c;
  }
  if (huePrime >= 4 && huePrime < 5) {
    r = x;
    g = 0;
    b = c;
  }

  if (huePrime >= 5 && huePrime < 6) {
    r = c;
    g = 0;
    b = x;
  }

  return [
    clamp((r + m) * 255, 0, 255),
    clamp((g + m) * 255, 0, 255),
    clamp((b + m) * 255, 0, 255),
  ];
};
