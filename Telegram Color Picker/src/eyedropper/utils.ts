export const EYE_DROPPER_SHADER = `
  uniform vec2 size;
  uniform vec2 nestedSize;
  uniform vec2 gesturePos;
  uniform shader image;

  vec4 main(vec2 xy) {
    vec2 st = xy / size;
    float dst = distance(st, vec2(0.5));

    st = fract(st * 11);
    float grid = 1 - (step(0.025, st.x) * step(st.x, 0.975) * step(0.025, st.y) * step(st.y, 0.975));

    if(dst < 0.35) {
      vec2 acc = xy - (size / 2);
      vec2 finalst = clamp(gesturePos + (acc / 5), vec2(0), nestedSize);

      if(grid == 0) return image.eval(finalst);
      return vec4(grid);
    }

    if(dst >= 0.35 && dst <= 0.4) {
      return vec4(1);
    }

    if(dst > 0.4 && dst <= 0.5) {
      return image.eval(gesturePos);
    }

    return vec4(0);
  }
`;
