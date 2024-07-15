const hsl2rgbFunc = `
  vec3 hsl(float h, float s, float l) {
    float c = (1 - abs(2 * l - 1)) * s;
    float huePrime = h / 60.0;
    float x = c * (1 - abs((mod(huePrime, 2.0)) - 1));
    float m = l - c / 2;

    float r = 0;
    float g = 0;
    float b = 0;

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

    return vec3(r + m, g + m, b + m);
  }
`;

export const HUE_SHADER = `
  uniform vec2 canvas;

  const float PI = 3.141592653589793;

  ${hsl2rgbFunc}

  vec4 main(vec2 xy) {
    vec2 uv = xy / canvas;
    vec2 pos = vec2(uv.x - 0.5, -1 * (uv.y - 0.5));
    float angle = atan(pos.y, pos.x);
    
    float result = mod(angle + (2 * PI), 2 * PI) * (180 / PI);

    return vec4(hsl(result, 1, 0.5), 1);
  }
`;

export const SELECTION_SHADER = `
  uniform vec2 canvas;
  uniform float hue;

  const float PI = 3.141592653589793;

  ${hsl2rgbFunc}

  float inOut(float x) {
    return 1 - (1 - x) * (1 - x);
  }

  vec4 main(vec2 xy) {
    vec2 uv = xy / canvas;
    vec2 pos = (xy / canvas) - 0.5;
    float angle = atan(pos.y, pos.x);
    
    float result = mod(angle + (2 * PI), 2 * PI) * (180 / PI);

    return vec4(hsl(hue, inOut(uv.x), 1 - uv.y), 1);
  }
`;
