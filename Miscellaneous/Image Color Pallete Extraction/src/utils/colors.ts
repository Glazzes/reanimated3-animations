import { createPixelArray, validateOptions } from "./core";
import quantize from "./quantize";

export const getPallete = (
  pixels: number[],
  colorCount?: number,
  quality?: number,
): string[] => {
  const options = validateOptions({ colorCount, quality });

  const rgbPixels = createPixelArray(
    pixels,
    pixels.length / 4,
    options.quality,
  );

  const cmap = quantize(rgbPixels, options.colorCount);
  const palette = cmap ? cmap.palette() : null;

  return (palette as number[][]).map((color) => {
    return `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
  });
};

export const getDominantColor = (
  pixels: number[],
  quality = 10,
): string | null => {
  const pallete = getPallete(pixels, 5, quality);

  return pallete?.[0];
};
