export const rotate2d = (x: number, y: number, angle: number) => {
  "worklet";
  const x1 = x * Math.cos(angle) - y * Math.sin(angle);
  const y1 = x * Math.sin(angle) + y * Math.cos(angle);

  return { x: x1, y: y1 };
};
