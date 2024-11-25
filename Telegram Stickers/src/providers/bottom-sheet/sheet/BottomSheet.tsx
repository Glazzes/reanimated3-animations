import React, {
  forwardRef,
  useCallback,
  useContext,
  useImperativeHandle,
} from "react";
import {
  ListRenderItemInfo,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import Animated, {
  cancelAnimation,
  clamp,
  scrollTo,
  useAnimatedRef,
  useAnimatedStyle,
  useAnimatedReaction,
  useSharedValue,
  withDecay,
  withSpring,
  withTiming,
  runOnUI,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { randomUUID } from "expo-crypto";
import Constants from "expo-constants";

import { images } from "@constants/images";
import { snapPoint } from "@utils/snapPoint";

import StickerPreview from "./StickerPreview";
import { BottomSheetType } from "../types";
import { StickerContext } from "../../stickers/StickerProvider";

const COLUMS = 4;
const statusBarHeight = Constants.statusBarHeight;

function keyExtractor(item: number, index: number) {
  return `item-${item}-index-${index}`;
}

const BottomSheet = (_: unknown, ref?: React.ForwardedRef<BottomSheetType>) => {
  const listRef = useAnimatedRef();
  const { width, height } = useWindowDimensions();

  const { setStickers, stickerHistory, activeStickerIndex } =
    useContext(StickerContext);

  const rootTranslate = useSharedValue<number>(height);
  const translate = useSharedValue<number>(height / 2);
  const offset = useSharedValue<number>(0);
  const contentHeight = useSharedValue<number>(0);

  const notchOpacity = useSharedValue<number>(1);

  const open = () => {
    "worklet";
    rootTranslate.value = withSpring(0);
  };

  const close = () => {
    "worklet";
    rootTranslate.value = withTiming(height, undefined, () => {
      translate.value = height / 2;
    });
  };

  // This function will not change due to their dependencies
  const addSticker = (source: number) => {
    const setNewSticker = () => {
      setStickers((prev) => {
        const newId = randomUUID();
        return [...prev, { id: newId, source }];
      });
    };

    runOnUI(() => {
      "worklet";
      close();

      const numberOfStickers = stickerHistory.value.length;
      stickerHistory.value = [...stickerHistory.value, numberOfStickers];
      activeStickerIndex.value = numberOfStickers;

      runOnJS(setNewSticker)();
    })();
  };

  const renderItem = useCallback(
    (info: ListRenderItemInfo<number>) => {
      return <StickerPreview addSticker={addSticker} source={info.item} />;
    },
    [1],
  );

  const onContentSizeChange = (_: number, ch: number) => {
    contentHeight.value = ch;
  };

  const getItemLayout = useCallback(
    (data: any, index: number) => {
      const itemSize = width / 4;
      return { index, length: itemSize, offset: itemSize * index };
    },
    [width],
  );

  const panGesture = Gesture.Pan()
    .maxPointers(1)
    .onStart(() => {
      cancelAnimation(translate);
      offset.value = translate.value;
    })
    .onUpdate((e) => {
      translate.value = offset.value + e.translationY;
    })
    .onEnd((e) => {
      if (translate.value > height / 2) {
        const points = [height / 2, height];
        const snap = snapPoint(translate.value, e.velocityY, points);

        if (snap === points[0]) translate.value = withSpring(snap);
        if (snap === points[1]) close();

        return;
      }

      const lowerBound =
        -1 * Math.max(0, contentHeight.value - height + statusBarHeight);
      translate.value = withDecay({
        velocity: e.velocityY,
        clamp: [lowerBound, height / 2],
      });
    });

  const rootAnimatedStyle = useAnimatedStyle(() => {
    return {
      width,
      height,
      zIndex: 999_999_999,
      transform: [{ translateY: rootTranslate.value }],
    };
  }, [rootTranslate]);

  const detectionAnimatedStyle = useAnimatedStyle(() => {
    const translateY = clamp(translate.value, 0, height);
    return { width, height, transform: [{ translateY }] };
  }, [translate]);

  useAnimatedReaction(
    () => translate.value,
    (value) => {
      const showNotch = value > statusBarHeight * 1.5;
      notchOpacity.value = withTiming(showNotch ? 1 : 0, { duration: 150 });

      const scroll = value > 0 ? 0 : -1 * value;
      scrollTo(listRef, 0, scroll, false);
    },
    [translate, statusBarHeight],
  );

  // Ref handling
  useImperativeHandle(ref, () => ({ open, close }));

  return (
    <Animated.View style={[rootAnimatedStyle, styles.absolute]}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.container, detectionAnimatedStyle]}>
          <View style={styles.header}>
            <Animated.View
              style={[styles.headerNotch, { opacity: notchOpacity }]}
            />
          </View>
          <Animated.FlatList
            ref={listRef}
            data={images}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            getItemLayout={getItemLayout}
            scrollEnabled={false}
            numColumns={COLUMS}
            windowSize={3}
            initialNumToRender={30}
            onContentSizeChange={onContentSizeChange}
          />
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  absolute: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  container: {
    backgroundColor: "#1F1F1F",
    borderTopLeftRadius: 16,
    borderTopEndRadius: 16,
    overflow: "hidden",
  },
  header: {
    height: statusBarHeight,
    justifyContent: "center",
    alignItems: "center",
  },
  headerNotch: {
    width: "12.5%",
    height: 4,
    borderRadius: 4,
    backgroundColor: "#3F3F3F",
  },
});

export default forwardRef(BottomSheet);
