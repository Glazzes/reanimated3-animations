import { interpolateColor } from 'react-native-reanimated';

// Why isn't this an object? I required an array in order to resemble the vec3 structure
// seen in glsl. And no, glsl nor skls accept objects as uniforms for vec3.
export type RGB = [number, number, number];

/**
 * @param {string} color string repesenting a hexadecimal color, ie #3366ff
 * @param {'rgb255' | 'rgb1'} format a string representing the desired output format, "rgb255" for
 * values ranging from 0 to 255 and "rgb1" for values ranging from 0 to 1
 * @returns {[number, number, number]} number array of size three representing an rgb color
 * @description Converts a hexadecimal color to it's rgb color equivalent, this function is meant for
 * speed, so it's up to the caller to validate the hexColor param follows the hexadecimal format.
 */
export const hex2rgb = (color: string, format: 'rgb255' | 'rgb1'): RGB => {
  'worklet';
  const balancer = format === 'rgb255' ? 1 : 1 / 255;

  if (color.length === 4) {
    const r = parseInt(color[1] + color[1], 16);
    const g = parseInt(color[2] + color[2], 16);
    const b = parseInt(color[3] + color[3], 16);

    return [r * balancer, g * balancer, b * balancer];
  }

  const r = parseInt(color[1] + color[2], 16);
  const g = parseInt(color[3] + color[4], 16);
  const b = parseInt(color[5] + color[6], 16);

  return [r * balancer, g * balancer, b * balancer];
};

export const mix = (x: string, y: string, progress: number): string => {
  'worklet';
  return interpolateColor(progress, [0, 1], [x, y], 'RGB', {
    gamma: 2.2,
  });
};
