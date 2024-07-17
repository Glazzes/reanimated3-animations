import React, { useEffect, useRef, useState } from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
} from 'react-native-reanimated';
import { ImageFormat, SkiaDomView } from '@shopify/react-native-skia';
import { writeAsStringAsync, documentDirectory } from 'expo-file-system';
import {
  createAlbumAsync,
  createAssetAsync,
  requestPermissionsAsync,
} from 'expo-media-library';
import Icon from '@expo/vector-icons/MaterialIcons';

import PatternList from './PatternList';
import { Box, Text } from '@ui/components';

import { patterns } from '@constants/data';
import { useTheme } from '@shopify/restyle';
import { type Theme } from '@ui/configuration/theme';

import {
  PatternChangeOptions,
  emitThemeChangeEvent,
  listenToPatternChangeEvent,
} from '../events';

type PatternSelectorProps = {
  canvasRef: React.RefObject<SkiaDomView>;
  onLayout: (e: LayoutChangeEvent) => void;
};

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

const PatternSelector: React.FC<PatternSelectorProps> = ({
  canvasRef,
  onLayout,
}) => {
  const { width, height } = useWindowDimensions();

  const index = useRef<number>(0);
  const [isDisabled, setDisabled] = useState<boolean>(false);

  const theme = useTheme<Theme>();
  const buttonColor = useSharedValue(patterns[0].accentColor);
  const lastColor = useSharedValue(patterns[0].accentColor);

  const iconProps = useAnimatedProps(
    () => ({
      color: buttonColor.value,
    }),
    [buttonColor]
  );

  const changeTheme = (e: GestureResponderEvent) => {
    const raidus = Math.max(width, height);
    emitThemeChangeEvent({
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY,
      raidus,
    });
  };

  const saveImage = async () => {
    if (isDisabled) return;
    setDisabled(true);
    buttonColor.value = withTiming(theme.colors.shareBtnDisableBG);

    try {
      const image = await canvasRef.current?.makeImageSnapshotAsync();
      if (image === undefined) return;

      const { granted } = await requestPermissionsAsync();
      if (!granted) {
        console.log('permissions not granted');
        return;
      }

      const base64 = image.encodeToBase64(ImageFormat.JPEG, 100);
      const uri = documentDirectory + `qr${index.current}.jpeg`;
      await writeAsStringAsync(uri, base64, { encoding: 'base64' });

      const asset = await createAssetAsync(uri);
      await createAlbumAsync('Test', asset);
    } finally {
      index.current += 1;
      buttonColor.value = withTiming(lastColor.value);
      setDisabled(false);
    }
  };

  const updateAccentColor = ({ accentColor }: PatternChangeOptions) => {
    buttonColor.value = withTiming(accentColor);
    lastColor.value = accentColor;
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: '100%',
      borderRadius: theme.spacing.s,
      backgroundColor: buttonColor.value,
      padding: theme.spacing.m,
    };
  });

  useEffect(() => {
    const sub = listenToPatternChangeEvent(updateAccentColor);
    return () => {
      sub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      onLayout={onLayout}
      width={'100%'}
      backgroundColor={'mainBackground'}
      elevation={theme.isDark ? 0 : 2}
      position={'absolute'}
      bottom={0}
      paddingVertical={'m'}
      borderTopLeftRadius={theme.spacing.s}
      borderTopRightRadius={theme.spacing.s}
    >
      <Box
        flexDirection={'row'}
        alignItems={'center'}
        justifyContent={'space-between'}
        paddingHorizontal={'m'}
      >
        <Text color={'shareCodeText'} fontSize={20} fontWeight={'700'}>
          Codigo QR
        </Text>

        <Pressable onPress={changeTheme}>
          <AnimatedIcon
            animatedProps={iconProps}
            name={theme.isDark ? 'wb-sunny' : 'dark-mode'}
            size={theme.spacing.l}
          />
        </Pressable>
      </Box>

      <PatternList />

      <Pressable onPress={saveImage}>
        <Box paddingHorizontal={'m'}>
          <Animated.View style={animatedStyle}>
            <Text
              color={'shareButtonText'}
              textAlign={'center'}
              fontWeight={'bold'}
            >
              Compartir codigo QR
            </Text>
          </Animated.View>
        </Box>
      </Pressable>
    </Box>
  );
};

export default React.memo(PatternSelector, (prev, next) => {
  return prev.canvasRef === next.canvasRef;
});
