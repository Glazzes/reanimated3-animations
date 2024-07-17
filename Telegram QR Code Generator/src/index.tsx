import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  LayoutChangeEvent,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {
  Canvas,
  Image,
  Skia,
  useImage,
  RoundedRect,
  rrect,
  rect,
  useFont,
  Group,
  PathOp,
  useCanvasRef,
} from '@shopify/react-native-skia';
import { setStatusBarHidden } from 'expo-status-bar';
import { useTheme } from '@shopify/restyle';

import PatternSelector from '@selection/PatternSelector';
import Background from './components/Background';
import { renderQrCode } from './generator';
import QRBackground from './components/QRBackground';
import { Theme } from '@ui/configuration/theme';
import Plane from './components/Plane';

const TAU = Math.PI * 2;
const ROTATION_TIME = 10 * 1000;
const scheme = 'https://t.me/';
const TAG = '@STARGAZER';

const COMPLETE_TAG = `${scheme}/${TAG.toLocaleLowerCase()}`;

const Index: React.FC = ({}) => {
  const { width, height } = useWindowDimensions();

  const canvasRef = useCanvasRef();
  const theme = useTheme<Theme>();

  const avatar = useImage(require('@assets/images/avatar.png'));

  const [text, setText] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const angle = useSharedValue<number>(0);

  const DIRECTION = width < height ? width : height;
  const QR_CODE_SIZE = DIRECTION * 0.6;
  const PADDING_HORIZONTAL = DIRECTION * 0.2;
  const PADDING_VERTICAL = (PADDING_HORIZONTAL / 2) * 0.7;

  const FONT_RESIZER = 1.15;
  const font = useFont(
    require('@assets/fonts/Roboto-Bold.ttf'),
    PADDING_VERTICAL * FONT_RESIZER
  );

  const AVATAR_SIZE = QR_CODE_SIZE * 0.425;
  const CONTAINER_HEIGHT =
    AVATAR_SIZE +
    QR_CODE_SIZE +
    PADDING_VERTICAL * 3 +
    PADDING_VERTICAL * FONT_RESIZER;

  const AVATAR_POS_X = (DIRECTION - AVATAR_SIZE) / 2;
  const AVATAR_POS_Y = (height - CONTAINER_HEIGHT) / 2;

  const QR_CODE_POS_X = PADDING_HORIZONTAL;
  const QR_CODE_POS_Y = AVATAR_POS_Y + AVATAR_SIZE + PADDING_VERTICAL;

  const CONTAINER_WIDTH = QR_CODE_SIZE + PADDING_HORIZONTAL;
  const CONTAINER_POS_X = PADDING_HORIZONTAL / 2;
  const CONTAINER_POS_Y = AVATAR_POS_Y + AVATAR_SIZE / 2;

  const TEXT_POS_X =
    text.width > QR_CODE_SIZE
      ? QR_CODE_POS_X - (text.width - QR_CODE_SIZE) / 2
      : QR_CODE_POS_X + (QR_CODE_SIZE - text.width) / 2;
  const TEXT_POS_Y = QR_CODE_POS_Y + QR_CODE_SIZE + PADDING_VERTICAL * 2;

  const qrInfo = useMemo(() => {
    if (font === null) return null;

    const clipPathInfo = renderQrCode({
      value: COMPLETE_TAG,
      frameSize: QR_CODE_SIZE,
      position: { x: QR_CODE_POS_X, y: QR_CODE_POS_Y },
      borderRadiusRatio: AVATAR_SIZE / 4 / CONTAINER_WIDTH,
    });

    const usernamePath = Skia.Path.MakeFromText(
      TAG,
      TEXT_POS_X,
      TEXT_POS_Y,
      font
    )!;

    const path = Skia.Path.MakeFromOp(
      clipPathInfo.path,
      usernamePath,
      PathOp.Union
    )!;

    return { path, content: clipPathInfo.content };
  }, [
    font,
    QR_CODE_SIZE,
    QR_CODE_POS_X,
    QR_CODE_POS_Y,
    AVATAR_SIZE,
    CONTAINER_WIDTH,
    TEXT_POS_X,
    TEXT_POS_Y,
  ]);

  const animateRotation = () => {
    angle.value = 0;
    angle.value = withRepeat(
      withTiming(TAU, { duration: ROTATION_TIME, easing: Easing.linear }),
      -1,
      false
    );
  };

  const translateX = useSharedValue<number>(0);
  const rootAnimatedStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          -1 * translateX.value +
          PADDING_VERTICAL * 0.8 +
          (height - CONTAINER_HEIGHT) / 2,
      },
    ],
  }));

  const layout = (e: LayoutChangeEvent) => {
    translateX.value = e.nativeEvent.layout.height;
  };

  useEffect(() => {
    if (font !== null) {
      const measurement = font.measureText(TAG);
      setText({ width: measurement.width, height: measurement.height });
    }
  }, [font]);

  useEffect(() => {
    animateRotation();
    setStatusBarHidden(true, 'none');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!avatar && !font) {
    return null;
  }

  return (
    <View style={styles.root}>
      <Animated.View style={rootAnimatedStyles}>
        <Canvas ref={canvasRef} style={{ width, height }}>
          <Background angle={angle} theme={theme} />

          <RoundedRect
            x={CONTAINER_POS_X}
            y={CONTAINER_POS_Y}
            width={CONTAINER_WIDTH}
            height={CONTAINER_HEIGHT - AVATAR_SIZE / 2}
            color={'#fff'}
            r={AVATAR_SIZE / 4}
          />

          {qrInfo && (
            <Group clip={qrInfo.path}>
              <QRBackground
                x={QR_CODE_POS_X - PADDING_HORIZONTAL / 4}
                y={QR_CODE_POS_Y}
                center={QR_CODE_SIZE / 2}
                width={QR_CODE_SIZE + PADDING_HORIZONTAL / 2}
                height={QR_CODE_SIZE + PADDING_VERTICAL + text.height * 1.5}
                angle={angle}
                theme={theme}
              />
            </Group>
          )}

          <Plane
            x={qrInfo?.content.cx ?? 0}
            y={qrInfo?.content.cy ?? 0}
            radius={qrInfo?.content.r ?? 0}
          />

          <Image
            x={AVATAR_POS_X}
            y={AVATAR_POS_Y}
            width={AVATAR_SIZE}
            height={AVATAR_SIZE}
            image={avatar}
            clip={rrect(
              rect(AVATAR_POS_X, AVATAR_POS_Y, AVATAR_SIZE, AVATAR_SIZE),
              AVATAR_SIZE / 2,
              AVATAR_SIZE / 2
            )}
            transform={[{ translateY: -1 * AVATAR_SIZE * 0.075 }]}
          />
        </Canvas>
      </Animated.View>

      <PatternSelector canvasRef={canvasRef} onLayout={layout} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Index;
