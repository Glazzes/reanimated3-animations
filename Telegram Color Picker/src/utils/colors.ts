import { clamp } from "react-native-reanimated";

import type { HSL, RGB } from "./types";

export const hsl2rgb = (h: number, s: number, l: number): RGB => {
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

  if (huePrime >= 5) {
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

export const rgb2hsl = (color: RGB): HSL => {
  "worklet";
  let [r, g, b] = color;

  r /= 255;
  g /= 255;
  b /= 255;

  const l = Math.max(r, g, b);
  const s = l - Math.min(r, g, b);
  const h = s
    ? l === r
      ? (g - b) / s
      : l === g
        ? 2 + (b - r) / s
        : 4 + (r - g) / s
    : 0;

  const hue = 60 * h < 0 ? 60 * h + 360 : 60 * h;
  const saturation = s
    ? l <= 0.5
      ? s / (2 * l - s)
      : s / (2 - (2 * l - s))
    : 0;
  const lightness = (2 * l - s) / 2;

  return { h: hue, s: saturation, l: lightness };
};

export const stringifyRGB = (color: RGB): string => {
  "worklet";
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
};
