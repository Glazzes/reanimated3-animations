export const hsl2rgbShaderFunction = `
  vec3 hsl2rgb(float h, float s, float l) {
    float d = s * (1.0 - abs(2.0 * l - 1.0));
    float m = l - d / 2.0;
    float x = d * (1.0 - abs(mod((h / 60), 2.0) - 1.0));

    if(h >= 0.0 && h <= 60) {
      return vec3(d + m, x + m, m);
    } else if (h >= 60 && h <= 120) {
      return vec3(x + m, d + m, m);
    } else if (h >= 120 && h <= 180) {
      return vec3(m, d + m, x + m);
    } else if (h >= 180 && h <= 240) {
      return vec3(m, x + m, d + m);
    } else if(h >= 240 && h <= 300) {
      return vec3(x + m, m, d + m);
    } else {
      return vec3(d + m, m, x + m);
    }
  }
`;
