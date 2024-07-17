import React, { useEffect } from 'react';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {
  CornerPathEffect,
  Path,
  Skia,
  Transforms3d,
  useClock,
  vec,
} from '@shopify/react-native-skia';
import { createNoise2D } from '../utils/noise';

type PlaneProps = {
  x: number;
  y: number;
  radius: number;
};

const noiseX = createNoise2D();
const noiseY = createNoise2D();

const Plane: React.FC<PlaneProps> = ({ x, y, radius }) => {
  const size = (radius * 1.5) / Math.SQRT2;

  const clock = useClock();
  const rotateY = useSharedValue<number>(0);

  const transform = useDerivedValue<Transforms3d>(() => {
    const tx = radius * 0.1 * noiseX(clock.value / 4000, 0);
    const ty = radius * 0.1 * noiseY(clock.value / 1000, 0);

    return [
      { translateX: tx },
      { translateY: ty },
      { rotate: Math.PI / 4.5 },
      { translateY: (-1 * (radius * 2 - size)) / 8 },
      { perspective: 100 },
      { rotateX: Math.PI / 6.5 },
      { rotateY: rotateY.value },
    ];
  });

  const plane = Skia.Path.MakeFromSVGString(
    `M ${x} ${y - size / 2} 
     l ${-size / 2} ${size} 
     l ${size * 0.4} 0 
     l ${size * 0.1} ${-size * 0.4}
     l ${size * 0.1} ${size * 0.4}
     l ${size * 0.4} 0
     z
    `
  )!;

  useEffect(() => {
    rotateY.value = withRepeat(
      withTiming((-1 * Math.PI) / 3, {
        duration: 750,
        easing: Easing.linear,
      }),
      -1,
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Path path={plane} color={'#fff'} origin={vec(x, y)} transform={transform}>
      <CornerPathEffect r={radius / 10} />
    </Path>
  );
};

export default Plane;
