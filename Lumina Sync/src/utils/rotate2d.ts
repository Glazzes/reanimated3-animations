type Vector = {
  x: number;
  y: number;
};

export const rotate2d = (vector: Vector, angle: number): Vector => {
  "worklet";
  const x = vector.x * Math.cos(angle) - vector.y * Math.sin(angle);
  const y = vector.x * Math.sin(angle) + vector.y * Math.cos(angle);

  return { x, y };
};
