export const SHADER_SOURCE = `
  uniform float angle;
  uniform float progress;

  uniform vec2 resolution;
  uniform vec2 center;

  uniform vec3 from1;
  uniform vec3 from2;
  uniform vec3 from3;
  uniform vec3 from4;

  uniform vec3 to1;
  uniform vec3 to2;
  uniform vec3 to3;
  uniform vec3 to4;

  const vec4 TRANSPARENT = vec4(0.0);

  mat2 rotationMatrix(float angle) {
    return mat2(
      cos(angle), -1.0 * sin(angle),
      sin(angle), cos(angle)
    );
  }

  vec4 main(vec2 pos) {
    vec2 st = pos.xy / resolution.xy;

    st -= center;
    st *= rotationMatrix(angle);
    st += center;

    vec3 color1 = mix(from1, to1, progress);
    vec3 color2 = mix(from2, to2, progress);
    vec3 color3 = mix(from3, to3, progress);
    vec3 color4 = mix(from4, to4, progress);
    
    float gradientX = smoothstep(0.2, 0.8, st.x);
    float gradientY = smoothstep(0.2, 0.8, st.y);

    vec3 halfOne = mix(color1, color2, gradientX);
    vec3 halfTwo = mix(color3, color4, gradientX);
    
    vec3 final = mix(halfOne, halfTwo, gradientY);
    return vec4(final, 1.0);
  }
`;

export const GRADIENT_THUMBNAIL = `
  uniform float width;
  uniform float height;
  uniform vec2 center;

  uniform vec3 color1;
  uniform vec3 color2;
  uniform vec3 color3;
  uniform vec3 color4;

  vec4 main(vec2 pos) {
    vec2 st = pos / vec2(width, height);
    float gradientX = smoothstep(0.2, 0.8, st.x);
    float gradientY = smoothstep(0.2, 0.8, st.y);

    vec3 halfOne = mix(color1, color2, gradientX);
    vec3 halfTwo = mix(color3, color4, gradientX);
    
    vec3 final = mix(halfOne, halfTwo, gradientY);
    return vec4(final, 1.0);
  }
`;
