import { hsl2rgb, stringifyRGB } from "../utils/colors";
import {
  GRID_CELL_SIZE,
  GRID_WIDTH_CONUT,
  RAD2DEG,
  TAU,
} from "../utils/constants";
import type { RGB } from "../utils/types";

type GridCellData = {
  color: string;
  rawColor: RGB;
  x: number;
  y: number;
};

export const buildColorGrid = (): GridCellData[] => {
  const deg30 = Math.PI / 6;

  const cells = 120;
  const cellData: GridCellData[] = [];

  for (let i = 0; i < cells; i++) {
    const x1 = i % GRID_WIDTH_CONUT;
    const x = (i % GRID_WIDTH_CONUT) * GRID_CELL_SIZE;
    const y = Math.floor(i / GRID_WIDTH_CONUT) * GRID_CELL_SIZE;

    let hue = Math.round(((Math.PI + x1 * deg30 + TAU) % TAU) * RAD2DEG);

    const y1 = Math.floor(i / GRID_WIDTH_CONUT);
    let lightness = 0.5;
    if (y1 > 0 && y1 < 5) {
      lightness = 0.5 - 0.055 * (5 - y1);
    }

    if (y1 > 5) {
      lightness = 0.5 + 0.075 * (y1 - 5);
    }

    let saturation = 0.8;
    if (i < GRID_WIDTH_CONUT) {
      hue = 0;
      saturation = 0;
      lightness = 1 - i / (GRID_WIDTH_CONUT - 1);
    }

    const rawRGBColor = hsl2rgb(hue, saturation, lightness);
    const color = stringifyRGB(rawRGBColor);
    cellData.push({ color, rawColor: rawRGBColor, x, y });
  }

  return cellData;
};

export const getLuminance = (color: RGB): number => {
  "worklet";
  const a = color.map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  // @ts-ignore
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};
