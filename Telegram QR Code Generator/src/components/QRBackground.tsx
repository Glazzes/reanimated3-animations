import React, { useEffect } from 'react';
import {
  Easing,
  SharedValue,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Rect, Shader, Skia } from '@shopify/react-native-skia';

import { patterns } from '@constants/data';
import { Theme } from '@ui/configuration/theme';
import { RGB, hex2rgb } from '../utils/colors';
import {
  PatternChangeOptions,
  listenToPatternChangeEvent,
} from '@events/index';
import { SHADER_SOURCE } from '@constants/shader';

type QRBackgroundProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  center: number;
  angle: SharedValue<number>;
  theme: Theme;
};

type Colors = [RGB, RGB, RGB, RGB];

const shader = Skia.RuntimeEffect.Make(SHADER_SOURCE)!;

const QRBackground: React.FC<QRBackgroundProps> = ({
  x,
  y,
  width,
  height,
  center,
  angle,
  theme,
}) => {
  const initalColors = theme.isDark
    ? patterns[0].qrCodeDarkColors
    : patterns[0].qrCodeLightColors;

  const lastIndex = useSharedValue<number>(0);
  const progress = useSharedValue<number>(0);
  const fromColors = useSharedValue<Colors>([
    hex2rgb(initalColors[0], 'rgb1'),
    hex2rgb(initalColors[1], 'rgb1'),
    hex2rgb(initalColors[2], 'rgb1'),
    hex2rgb(initalColors[3], 'rgb1'),
  ]);

  const toColors = useSharedValue<Colors>([
    hex2rgb(initalColors[0], 'rgb1'),
    hex2rgb(initalColors[1], 'rgb1'),
    hex2rgb(initalColors[2], 'rgb1'),
    hex2rgb(initalColors[3], 'rgb1'),
  ]);

  const uniforms = useDerivedValue(() => {
    return {
      progress: progress.value,
      angle: angle.value,
      resolution: [width, height],
      center: [center / width, center / height],
      from1: fromColors.value[0],
      from2: fromColors.value[1],
      from3: fromColors.value[2],
      from4: fromColors.value[3],
      to1: toColors.value[0],
      to2: toColors.value[1],
      to3: toColors.value[2],
      to4: toColors.value[3],
    };
  }, [angle, progress, center, width, height, fromColors, toColors]);

  const changePattern = ({ index: newIndex }: PatternChangeOptions) => {
    lastIndex.value = newIndex;

    const { qrCodeDarkColors, qrCodeLightColors } = patterns[newIndex];
    const backgroundColors = theme.isDark
      ? qrCodeDarkColors
      : qrCodeLightColors;

    const newColors: Colors = [
      hex2rgb(backgroundColors[0], 'rgb1'),
      hex2rgb(backgroundColors[1], 'rgb1'),
      hex2rgb(backgroundColors[2], 'rgb1'),
      hex2rgb(backgroundColors[3], 'rgb1'),
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
  };

  useEffect(() => {
    const sub = listenToPatternChangeEvent(changePattern);

    return () => {
      sub.remove();
    };
  });

  useEffect(() => {
    // @ts-ignore
    changePattern({ index: lastIndex.value });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  return (
    <React.Fragment>
      <Rect x={x} y={y} width={width} height={height}>
        <Shader
          source={shader}
          uniforms={uniforms}
          transform={[{ translateX: x }, { translateY: y }]}
        />
      </Rect>
    </React.Fragment>
  );
};

export default QRBackground;
