import type { RGB } from "../utils/types";

const rgb2HexValues: { [id: number]: string | number } = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: "A",
  11: "B",
  12: "C",
  13: "D",
  14: "E",
  15: "F",
};

export const rgb2hex = (color: RGB): string => {
  "worklet";
  const r = Math.floor(color[0]);
  const g = Math.floor(color[1]);
  const b = Math.floor(color[2]);

  const r1 = rgb2HexValues[Math.floor(r / 16)];
  const r2 = rgb2HexValues[Math.round(r) % 16];
  const g1 = rgb2HexValues[Math.floor(g / 16)];
  const g2 = rgb2HexValues[Math.round(g) % 16];
  const b1 = rgb2HexValues[Math.floor(b / 16)];
  const b2 = rgb2HexValues[Math.round(b) % 16];

  return `${r1}${r2}${g1}${g2}${b1}${b2}`;
};

export const hex2rgb = (color: string): RGB | undefined => {
  const match = new RegExp("(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})").test(color);
  if (!match || color.length % 3 !== 0) return undefined;

  let r1 = color[0];
  let r2 = color[1];
  let g1 = color[2];
  let g2 = color[3];
  let b1 = color[4];
  let b2 = color[5];
  if (color.length === 3) {
    r1 = color[0];
    r2 = color[0];
    g1 = color[1];
    g2 = color[1];
    b1 = color[2];
    b2 = color[2];
  }

  const finalR = parseInt(r1!, 16) * 16 + parseInt(r2!, 16);
  const finalG = parseInt(g1!, 16) * 16 + parseInt(g2!, 16);
  const finalB = parseInt(b1!, 16) * 16 + parseInt(b2!, 16);

  return [finalR, finalG, finalB];
};
