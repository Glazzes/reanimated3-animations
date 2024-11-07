import React, { useContext, useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  measure,
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import { useImage } from "@shopify/react-native-skia";

import { useVector } from "@utils/hooks";
import { listenToFlipEvent } from "@utils/emitter";

import { StickerContext } from "@providers/index";
import { TAU, INITIAL_STICKER_SIZE } from "@constants/constants";
import { StickerState, StickerType } from "../types";

type PanGestureEvent = GestureUpdateEvent<PanGestureHandlerEventPayload>;

type StickerProps = {
  index: number;
  sticker: StickerType;
};

const INDICATOR_SIZE = 20;
const HITSLOP = (44 - INDICATOR_SIZE) / 2;

const BORDER_RADIUS = INITIAL_STICKER_SIZE / 2;

const Sticker: React.FC<StickerProps> = ({ index, sticker }) => {
  const {
    activeStickerIndex,
    stickerHistory,
    stickerStateContext,
    blockStickerGestures,
    openStickerMenu,
  } = useContext(StickerContext);

  const skiaSource = useImage(sticker.source as number);
  const stickerRef = useAnimatedRef();

  const translate = useVector(
    sticker.transform?.translate.x ?? 0,
    sticker.transform?.translate.y ?? 0,
  );
  const offset = useVector(0, 0);
  const scale = useSharedValue<number>(1);
  const center = useVector(0, 0); // center of the sticker on the screen, absolute position

  const zIndex = useSharedValue<number>(index);
  const ringScale = useSharedValue<number>(1);
  const ringOpacity = useSharedValue<number>(1);

  const radius = useSharedValue<number>(sticker.radius ?? BORDER_RADIUS);
  const rotate = useSharedValue<number>(sticker.transform?.rotate ?? 0);
  const rotateY = useSharedValue<number>(sticker.transform?.rotateY ?? 0);

  const displayBorder = (
    opacity: number,
    scaleValue: number,
    animate: boolean,
  ) => {
    "worklet";

    ringOpacity.value = animate ? withTiming(opacity) : opacity;
    ringScale.value = animate ? withTiming(scaleValue) : scaleValue;
  };

  const setStickerPosition = () => {
    "worklet";
    const { pageX, pageY, width, height } = measure(stickerRef)!;
    center.x.value = pageX + width / 2;
    center.y.value = pageY + height / 2;
  };

  const pan = Gesture.Pan()
    .maxPointers(1)
    .onStart(() => {
      if (blockStickerGestures.value) return;

      activeStickerIndex.value = index;
      offset.x.value = translate.x.value;
      offset.y.value = translate.y.value;
    })
    .onChange((e) => {
      if (blockStickerGestures.value) return;

      translate.x.value = offset.x.value + e.translationX;
      translate.y.value = offset.y.value + e.translationY;
    });

  const tap = Gesture.Tap()
    .numberOfTaps(1)
    .onStart(setStickerPosition)
    .onEnd(() => {
      if (blockStickerGestures.value) return;

      if (activeStickerIndex.value === index) {
        runOnJS(openStickerMenu)({ x: center.x.value, y: center.y.value });
        return;
      }

      activeStickerIndex.value = index;
      displayBorder(1, 1, true);

      scale.value = withRepeat(
        withTiming(0.9, {
          duration: 200,
          easing: Easing.bezier(0.26, 0.19, 0.42, 1.49),
        }),
        2,
        true,
      );
    });

  const onPanUpdate = (e: PanGestureEvent, direction: "right" | "left") => {
    "worklet";

    if (index !== activeStickerIndex.value || blockStickerGestures.value)
      return;

    const normalizedX = e.absoluteX - center.x.value;
    const normalizedY = -1 * (e.absoluteY - center.y.value);

    const currentRadius = Math.sqrt(normalizedX ** 2 + normalizedY ** 2);
    const angle = Math.atan2(normalizedY, normalizedX);

    // Both rings are the same, the only difference is the left one has an 180 degrees offset
    const acc = direction === "right" ? 0 : Math.PI;
    rotate.value = -1 * ((angle + acc + TAU) % TAU);
    radius.value = Math.max(BORDER_RADIUS / 2, currentRadius);
  };

  const rightIndicatorPan = Gesture.Pan()
    .hitSlop({ vertical: HITSLOP, horizontal: HITSLOP })
    .onStart(setStickerPosition)
    .onUpdate((e) => onPanUpdate(e, "right"));

  const leftIndicatorPan = Gesture.Pan()
    .hitSlop({ vertical: HITSLOP, horizontal: HITSLOP })
    .onStart(setStickerPosition)
    .onUpdate((e) => onPanUpdate(e, "left"));

  const stickerStyles = useAnimatedStyle(() => {
    const resizeScale = (radius.value * 2) / INITIAL_STICKER_SIZE;

    return {
      width: INITIAL_STICKER_SIZE,
      height: INITIAL_STICKER_SIZE,
      transform: [
        { rotate: `${rotate.value}rad` },
        { rotateY: `${rotateY.value}rad` },
        { scale: resizeScale },
        { scale: scale.value },
      ],
    };
  }, [rotate, rotateY, radius, scale]);

  const stickerContainerStyles = useAnimatedStyle(
    () => ({
      zIndex: zIndex.value,
      transform: [
        { translateX: translate.x.value },
        { translateY: translate.y.value },
      ],
    }),
    [zIndex, translate],
  );

  const ringStyles = useAnimatedStyle(
    () => ({
      width: radius.value * 2,
      height: radius.value * 2,
      borderRadius: radius.value,
      transform: [{ rotate: `${rotate.value}rad` }],
    }),
    [rotate, radius],
  );

  const ringContainerStyles = useAnimatedStyle(
    () => ({
      opacity: ringOpacity.value,
      transform: [{ scale: ringScale.value }],
    }),
    [ringOpacity, ringScale],
  );

  const leftIndicatorStyles = useAnimatedStyle(() => {
    const angle = rotate.value + Math.PI;
    const translateX = radius.value * Math.cos(angle);
    const translateY = radius.value * Math.sin(angle);
    return { transform: [{ translateX }, { translateY }] };
  }, [rotate, radius]);

  const rightIndicatorStyles = useAnimatedStyle(() => {
    const translateX = radius.value * Math.cos(rotate.value);
    const translateY = radius.value * Math.sin(rotate.value);
    return { transform: [{ translateX }, { translateY }] };
  }, [rotate, radius]);

  useDerivedValue(() => {
    if (index !== activeStickerIndex.value) return;

    const state: StickerState = {
      index: 0,
      source: sticker.source,
      skiaSource: skiaSource,
      radius: radius.value,
      transform: {
        rotate: rotate.value,
        rotateY: rotateY.value,
        translate: { x: translate.x.value, y: translate.y.value },
      },
    };

    stickerStateContext.value = {
      ...stickerStateContext.value,
      [index]: state,
    };
  });

  useAnimatedReaction(
    () => activeStickerIndex.value,
    (currentIndex) => {
      const isActive = currentIndex === index;

      zIndex.value = stickerHistory.value.indexOf(index);
      displayBorder(isActive ? 1 : 0, isActive ? 1 : 0, isActive);
    },
    [activeStickerIndex, stickerHistory, index],
  );

  useEffect(() => {
    const sub = listenToFlipEvent((idx) => {
      if (index !== idx) return;

      const toAngle = rotateY.value === Math.PI ? 0 : Math.PI;
      rotateY.value = withTiming(toAngle);
    });

    return () => sub.remove();
  }, [index, rotateY]);

  return (
    <GestureDetector gesture={Gesture.Race(pan, tap)}>
      <Animated.View
        style={[styles.stickerContainer, styles.center, stickerContainerStyles]}
      >
        <Animated.Image
          ref={stickerRef}
          source={sticker.source}
          resizeMethod={"scale"}
          style={stickerStyles}
        />

        <Animated.View
          style={[styles.ringContainer, styles.center, ringContainerStyles]}
        >
          <Animated.View style={[styles.ring, ringStyles]} />

          <GestureDetector gesture={leftIndicatorPan}>
            <Animated.View style={[styles.panIndicator, leftIndicatorStyles]} />
          </GestureDetector>

          <GestureDetector gesture={rightIndicatorPan}>
            <Animated.View
              style={[styles.panIndicator, rightIndicatorStyles]}
            />
          </GestureDetector>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  stickerContainer: {
    width: INITIAL_STICKER_SIZE,
    height: INITIAL_STICKER_SIZE,
    position: "absolute",
  },
  ringContainer: {
    width: INITIAL_STICKER_SIZE,
    height: INITIAL_STICKER_SIZE,
    position: "absolute",
  },
  ring: {
    borderWidth: 3,
    borderColor: "#fff",
    borderStyle: "dashed",
    position: "absolute",
  },
  panIndicator: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderWidth: 3,
    borderColor: "#fff",
    borderRadius: INDICATOR_SIZE / 2,
    backgroundColor: "#3366ff",
    position: "absolute",
  },
});

export default React.memo(
  Sticker,
  (prev, next) =>
    prev.index === next.index && prev.sticker.source === next.sticker.source,
);
