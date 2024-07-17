import React, { useCallback, useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import {
  Image,
  Fill,
  Shader,
  Skia,
  SkImage,
  Mask,
  Rect,
} from '@shopify/react-native-skia';
import { SHADER_SOURCE } from '@constants/shader';

import { patterns } from '@constants/data';
import { hex2rgb, type RGB } from '../utils/colors';
import { Theme } from '@ui/configuration/theme';
import {
  PatternChangeOptions,
  listenToPatternChangeEvent,
} from '@events/index';

type BackgroundProps = {
  theme: Theme;
  angle: SharedValue<number>;
};

type Colors = [RGB, RGB, RGB, RGB];

const shader = Skia.RuntimeEffect.Make(SHADER_SOURCE)!;
const { backgroundColors } = patterns[0];

const Background: React.FC<BackgroundProps> = ({ angle, theme }) => {
  const { width, height } = useWindowDimensions();
  const [image, setImage] = useState<SkImage | null>(null);

  // I want to avoid as many rerenders as its possible
  const progress = useSharedValue<number>(0);
  const fromColors = useSharedValue<Colors>([
    hex2rgb(backgroundColors[0], 'rgb1'),
    hex2rgb(backgroundColors[1], 'rgb1'),
    hex2rgb(backgroundColors[2], 'rgb1'),
    hex2rgb(backgroundColors[3], 'rgb1'),
  ]);

  const toColors = useSharedValue<Colors>([
    hex2rgb(backgroundColors[0], 'rgb1'),
    hex2rgb(backgroundColors[1], 'rgb1'),
    hex2rgb(backgroundColors[2], 'rgb1'),
    hex2rgb(backgroundColors[3], 'rgb1'),
  ]);

  const uniforms = useDerivedValue(() => {
    return {
      angle: angle.value,
      resolution: [width, height],
      center: [0.5, 0.5],
      progress: progress.value,
      from1: fromColors.value[0],
      from2: fromColors.value[1],
      from3: fromColors.value[2],
      from4: fromColors.value[3],
      to1: toColors.value[0],
      to2: toColors.value[1],
      to3: toColors.value[2],
      to4: toColors.value[3],
    };
  }, [width, height, angle, progress, fromColors, toColors]);

  const changePattern = useCallback(
    ({ index: newIndex, patternImage }: PatternChangeOptions) => {
      setImage(patternImage);

      const { backgroundColors: newPatternColors } = patterns[newIndex];
      const newColors: Colors = [
        hex2rgb(newPatternColors[0], 'rgb1'),
        hex2rgb(newPatternColors[1], 'rgb1'),
        hex2rgb(newPatternColors[2], 'rgb1'),
        hex2rgb(newPatternColors[3], 'rgb1'),
      ];

      toColors.value = newColors;

      progress.value = withTiming(
        1,
        { duration: 1000, easing: Easing.linear },
        (_) => {
          fromColors.value = newColors;
          progress.value = 0;
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  useEffect(() => {
    const sub = listenToPatternChangeEvent(changePattern);

    return () => {
      sub.remove();
    };
  });

  return (
    <React.Fragment>
      {!theme.isDark && (
        <>
          <Fill>
            <Shader source={shader} uniforms={uniforms} />
          </Fill>

          <Image
            image={image}
            x={0}
            y={0}
            width={width}
            height={height}
            fit={'cover'}
            opacity={0.3}
          />
        </>
      )}

      {theme.isDark && (
        <>
          <Fill color={'#000'} />
          <Mask
            mode="luminance"
            mask={
              <Image
                image={image}
                x={0}
                y={0}
                width={width}
                height={height}
                fit={'cover'}
                opacity={0.5}
              />
            }
          >
            <Rect x={0} y={0} width={width} height={height}>
              <Shader source={shader} uniforms={uniforms} />
            </Rect>
          </Mask>
        </>
      )}
    </React.Fragment>
  );
};

export default Background;
