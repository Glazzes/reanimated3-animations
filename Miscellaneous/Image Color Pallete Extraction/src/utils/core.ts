export const createPixelArray = (
  imgData: number[],
  pixelCount: number,
  quality: number,
): number[][] => {
  const pixels = imgData;
  const pixelArray: number[][] = [];

  for (let i = 0, offset, r, g, b, a; i < pixelCount; i = i + quality) {
    offset = i * 4;
    r = pixels[offset + 0] * 255;
    g = pixels[offset + 1] * 255;
    b = pixels[offset + 2] * 255;
    a = pixels[offset + 3] * 255;

    // If pixel is mostly opaque and not white
    if (typeof a === "undefined" || a >= 125) {
      if (!(r > 250 && g > 250 && b > 250)) {
        pixelArray.push([r, g, b]);
      }
    }
  }
  return pixelArray;
};

type ValidationOptions = {
  colorCount: number;
  quality: number;
};

export const validateOptions = (
  options: Partial<ValidationOptions>,
): ValidationOptions => {
  let { colorCount, quality } = options;

  if (typeof colorCount === "undefined" || !Number.isInteger(colorCount)) {
    colorCount = 10;
  } else if (colorCount === 1) {
    throw new Error(
      "colorCount should be between 2 and 20. To get one color, call getColor() instead of getPalette()",
    );
  } else {
    colorCount = Math.max(colorCount, 2);
    colorCount = Math.min(colorCount, 20);
  }

  if (
    typeof quality === "undefined" ||
    !Number.isInteger(quality) ||
    quality < 1
  ) {
    quality = 10;
  }

  return {
    colorCount,
    quality,
  };
};
