import React from 'react';
import { PatternOptions } from '../../constants/data';
import {
  RoundedRect,
  Group,
  Skia,
  FitBox,
  rect,
  ImageSVG,
  Rect,
} from '@shopify/react-native-skia';
import { Theme } from '@ui/configuration/theme';
import { useDerivedValue } from 'react-native-reanimated';
import { buildIcon } from './utils';

type QrCodeIconProps = {
  width: number;
  height: number;
  pattern: PatternOptions;
  theme: Theme; // For some reason theme is not accesibble in this component
};

const QrCodeIcon: React.FC<QrCodeIconProps> = ({ width, theme, pattern }) => {
  const POS_X = width * 0.3;
  const POS_Y = width * 0.2;
  const size = width * 0.4;

  const iconSize = size / 2;
  const iconX = POS_X + size / 4;
  const iconY = POS_Y + size / 4;

  const path = useDerivedValue(() => {
    const colors = theme.isDark
      ? pattern.qrCodeDarkColors
      : pattern.qrCodeLightColors;

    const svg = buildIcon(colors[0], colors[1], colors[2], colors[3]);
    return Skia.SVG.MakeFromString(svg)!;
  });

  return (
    <Group>
      <RoundedRect
        x={POS_X}
        y={POS_Y}
        width={size}
        height={size}
        color={'#fff'}
        r={theme.spacing.s / 2}
      />

      <ImageSVG
        x={0}
        y={0}
        width={iconSize}
        height={iconSize}
        svg={path}
        transform={[
          { translateX: iconX },
          { translateY: iconY },
          { scale: iconSize / 146 },
        ]}
      />
    </Group>
  );
};

export default QrCodeIcon;
