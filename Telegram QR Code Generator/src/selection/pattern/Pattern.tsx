import React from 'react';
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  type SharedValue,
  useAnimatedReaction,
  cancelAnimation,
} from 'react-native-reanimated';
import {
  Canvas,
  Fill,
  Shader,
  Skia,
  useCanvasRef,
  Image,
  Mask,
  Rect,
  useImage,
  Group,
} from '@shopify/react-native-skia';
import { useTheme } from '@shopify/restyle';

import { Box } from '@ui/components';
import { type Theme } from '@ui/configuration/theme';
import { PatternOptions } from '../../constants/data';
import { GRADIENT_THUMBNAIL } from '../../constants/shader';
import { hex2rgb } from '../../utils/colors';
import QrCodeIcon from './QrCodeIcon';
import { emitPatternChangeEvent } from '../../events';

type PatternProps = {
  index: number;
  pattern: PatternOptions;
  activeIndex: SharedValue<number>;
};

const source = Skia.RuntimeEffect.Make(GRADIENT_THUMBNAIL)!;

const Pattern: React.FC<PatternProps> = ({ pattern, index, activeIndex }) => {
  const ref = useCanvasRef();
  const theme = useTheme<Theme>();
  const patternImage = useImage(pattern.pattern);

  const { width: screenWidth } = useWindowDimensions();
  const width = screenWidth / 4;
  const height = width * 1.3;

  const uniforms = useDerivedValue(() => {
    const { backgroundColors } = pattern;
    const colors = [
      hex2rgb(backgroundColors[0], 'rgb1'),
      hex2rgb(backgroundColors[1], 'rgb1'),
      hex2rgb(backgroundColors[2], 'rgb1'),
      hex2rgb(backgroundColors[3], 'rgb1'),
    ];

    return {
      width: width,
      height: height,
      center: [0.5, 0.5],
      color1: colors[0],
      color2: colors[1],
      color3: colors[2],
      color4: colors[3],
    };
  }, [pattern]);

  const scale = useSharedValue<number>(1);
  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      fontSize: width / 3,
      bottom: theme.spacing.s * scale.value,
      transform: [{ scale: scale.value }],
    };
  });

  const progress = useSharedValue<number>(index === 0 ? 1 : 0);
  const borderStyles = useAnimatedStyle(() => {
    return {
      borderWidth: 2,
      borderColor: pattern.accentColor,
      borderRadius: theme.spacing.s * ((width * 1.3) / width),
      width: width + 8,
      height: height + 8,
      position: 'absolute',
      opacity: progress.value,
      transform: [{ scale: progress.value }],
    };
  });

  const changePattern = () => {
    activeIndex.value = index;
    if (patternImage) {
      emitPatternChangeEvent({
        accentColor: pattern.accentColor,
        index,
        patternImage,
      });
    }
  };

  useAnimatedReaction(
    () => ({ active: activeIndex.value, current: index }),
    ({ active, current }) => {
      cancelAnimation(progress);
      cancelAnimation(scale);

      const areIndexesEqual = active === current;
      progress.value = withTiming(areIndexesEqual ? 1 : 0);
      scale.value = areIndexesEqual
        ? withSequence(
            withTiming(1.8),
            withDelay(
              1250,
              withTiming(1, { duration: 150, easing: Easing.linear })
            )
          )
        : withTiming(1);
    }
  );

  return (
    <Pressable onPress={changePattern} style={styles.center}>
      <Animated.View pointerEvents={'none'} style={borderStyles} />

      <Box
        width={width}
        height={height}
        borderRadius={theme.spacing.s}
        overflow={'hidden'}
        backgroundColor={'patternBackground'}
      >
        <Canvas ref={ref} style={styles.canvas}>
          {theme.isDark ? (
            <Mask
              mode="luminance"
              mask={
                <>
                  {patternImage ? (
                    <Image
                      x={0}
                      y={0}
                      width={width}
                      height={height}
                      image={patternImage}
                      fit={'cover'}
                      opacity={0.6}
                      transform={[{ scale: 2.5 }]}
                    />
                  ) : null}
                </>
              }
            >
              <Rect x={0} y={0} width={width} height={height}>
                <Shader source={source} uniforms={uniforms} />
              </Rect>
            </Mask>
          ) : (
            <Group>
              <Fill>
                <Shader source={source} uniforms={uniforms} />
              </Fill>
              <Image
                image={patternImage}
                x={0}
                y={0}
                width={width}
                height={height}
                fit={'cover'}
                opacity={0.25}
                transform={[{ scale: 3.5 }]}
              />
            </Group>
          )}

          <QrCodeIcon
            width={width}
            height={height}
            pattern={pattern}
            theme={theme}
          />
        </Canvas>

        <Animated.Text style={[styles.emoji, textAnimatedStyle]}>
          {pattern.emoji}
        </Animated.Text>
      </Box>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
  emoji: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(Pattern, (prev, next) => {
  return prev.index === next.index;
});
