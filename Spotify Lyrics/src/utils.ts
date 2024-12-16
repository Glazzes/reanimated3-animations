export const mapTimeToText = (time: number): string => {
  "worklet";

  const seconds = Math.floor(time % 60);
  const minutes = Math.floor(time / 60);

  if (seconds < 10) {
    return `${minutes}:0${seconds}`;
  }

  return `${minutes}:${seconds}`;
};
