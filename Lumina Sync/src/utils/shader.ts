export const SHADER: string = `
  uniform float clock;
  uniform vec2 size;
  uniform vec2 circleCenter;

  const float cells = 29;
  const float cellSize = 1 / cells;
  const float ringSize = 0.3;
  const float influence = ringSize + 0.1;
  const float PI = 3.141592653589;

  // Function taken from https://thebookofshaders.com/05/kynd.png
  float shaping(float x) {
      x = x * 2 - 1;
      return 1.0 - pow(abs(sin(PI * x * 0.5)), 1.875);
  }

  vec4 main(vec2 xy) {
    vec2 uv = xy / size;

    // Split the shader into seperate boxes, one for each circle
    vec2 dualuv = vec2(uv.x, fract(uv.y * 2.0));
    vec2 cellPosition = floor(dualuv / cellSize) * cellSize + cellSize / 2;

    // Distance from the center of each cell to the center of  shader
    float cellCenterDistance = distance(cellPosition, vec2(0.5));

    // Generate each ring based on the distance of ringSize variable in a range from 0 to 1
    float finalDistance = mod(cellCenterDistance - clock, ringSize) / ringSize;

    // Create the grid and calculate the distance from the center for each particle
    vec2 griduv = fract(dualuv * cells);
    float girdCellCenterDistance = distance(griduv, vec2(0.5));

    // Circle of influence, decrease the maximun radius based on the cell distance to the center
    uv.y = uv.y / (size.x / size.y);
    float distanceFromCenter = distance(uv, circleCenter);
    float clampedDistance = clamp(distanceFromCenter / influence, 0, 1);
    clampedDistance *= clampedDistance;

    // Based on the distance from the cell to the ring calculate it's radius in a range of 1 0 1
    // This is achieved by the shaping function taken from the book of shaders
    float shape = shaping(1 - finalDistance);
    float radius = mix(0.1, 0.5, shape);

    // The max radius is 0.5 but is decreased if the influence circle if close enough
    float maxRadius = clamp(radius * clampedDistance, 0.1, 0.5);

    // Create an influence circle in bottom part of the second circle so it does not animate
    // The bottom half part of the circle so the text does not look bad
    if(xy.y >= size.y / 2) {
      float staticCircleDistance = distance(dualuv, vec2(1));
      float staticDistance = clamp(staticCircleDistance / (influence * 2.5), 0, 1);
      maxRadius = clamp(maxRadius * staticDistance * staticDistance, 0.1, 0.5);
    }

    float color = step(girdCellCenterDistance, maxRadius);
    return vec4(color);
  }
`;
