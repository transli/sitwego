import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  withTiming,
  runOnJS,
  useAnimatedProps,
  useDerivedValue,
} from "react-native-reanimated";
import Icon from "~/components/Icons";
import RnText from "~/components/RnText";
import { atoms } from "~/ui/theme/atoms";
import { useAppTheme } from "~/ui/theme/ThemeProvider";

const INITIAL_BOX_SIZE = 40;
const SLIDER_WIDTH = 120;
const MAX_VALUE = SLIDER_WIDTH - INITIAL_BOX_SIZE;

interface GoOnlineSliderProps {
  onStateChange: (isOnline: boolean) => void; // Callback for when animation completes
  isOnline: boolean;
}
const Animatedicon = Animated.createAnimatedComponent(Icon);
const GoOnlineSlider = ({ onStateChange, isOnline }: GoOnlineSliderProps) => {
  const _height = useSharedValue(0);
  const { colors } = useAppTheme();
  const _width = useSharedValue(0);
  const offset = useSharedValue(0);
  const onlineTextOpacity = useSharedValue(0);
  const offlineTextOpacity = useSharedValue(1);
  const iconName = useSharedValue("PowerOff");

  const [icon_name, updateIconName] = useState(false);

  useEffect(() => {
    if (isOnline) {
      offset.value = MAX_VALUE;
    } else {
      offset.value = 0;
    }
  }, [isOnline, offset]);
  const pan = Gesture.Pan()
    .onChange((event) => {
      offset.value = Math.max(
        0,
        Math.min(MAX_VALUE, offset.value + event.changeX),
      );
      const progress = offset.value / MAX_VALUE;
      onlineTextOpacity.value = progress;
      offlineTextOpacity.value = 1 - progress;

      // Update icon name in the JS thread when crossing midpoint
      if (offset.value > MAX_VALUE / 2 && iconName.value === "PowerOff") {
        runOnJS(updateIconName)(true);
      } else if (
        offset.value <= MAX_VALUE / 2 &&
        iconName.value === "CirclePower"
      ) {
        runOnJS(updateIconName)(false);
      }
    })
    .onEnd(() => {
      const threshold = MAX_VALUE / 2;
      const isOnline = offset.value > threshold;
      offset.value = withSpring(
        isOnline ? MAX_VALUE : 0,
        { stiffness: 100, damping: 20 },
        (finished) => {
          if (finished) {
            runOnJS(onStateChange)(isOnline);
          }
        },
      );
      onlineTextOpacity.value = withTiming(isOnline ? 1 : 0);
      offlineTextOpacity.value = withTiming(isOnline ? 0 : 1);
      runOnJS(updateIconName)(isOnline);
    });

  const visibleWidth = useDerivedValue(() => {
    return _width.value - _height.value;
  });

  const progress = useDerivedValue(() => {
    return Math.max(
      0,
      _height.value + Math.min(visibleWidth.value, offset.value),
    );
  });

  const sliderStyle = useAnimatedStyle(() => ({
    width: interpolateColor(progress.value, [0, 1], [1, 0]),
    transform: [{ translateX: offset.value }],
  }));

  const onLayout = (event: {
    nativeEvent: { layout: { height: number; width: number } };
  }) => {
    _width.value = event.nativeEvent.layout.width;
    _height.value = event.nativeEvent.layout.height;
  };

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      offset.value,
      [0, MAX_VALUE],
      ["rgba(239, 202, 116, 0.6)", "#18c78d"],
    ),
  }));

  const onlineTextStyle = useAnimatedStyle(() => ({
    opacity: onlineTextOpacity.value,
    color: colors.text,
    transform: [{ translateX: -(MAX_VALUE / 2) - 10 }],
  }));

  const offlineTextStyle = useAnimatedStyle(() => ({
    opacity: offlineTextOpacity.value,
    color: colors.text,
    transform: [{ translateX: MAX_VALUE / 2 + 10 }],
  }));

  const iconStyle = useAnimatedProps(() => ({
    color: interpolateColor(
      offset.value,
      [0, MAX_VALUE],
      ["rgb(239, 202, 116)", "#18c78d"],
    ),
  }));
  return (
    <View onLayout={onLayout} style={styles.container}>
      <Animated.View style={[styles.sliderTrack, trackStyle]}>
        <View style={styles.textContainer}>
          <RnText style={[atoms.text_sm, offlineTextStyle]}>Offline</RnText>
          <RnText style={[atoms.text_sm, onlineTextStyle]}>Online</RnText>
        </View>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.sliderHandle, sliderStyle]}>
            <Animatedicon
              animatedProps={iconStyle}
              name={icon_name ? "CirclePower" : "PowerOff"}
              size={38}
              color={iconStyle.color}
              strokeWidth={2}
            />
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  sliderTrack: {
    width: SLIDER_WIDTH,
    height: 40,
    borderRadius: 25,
    justifyContent: "center",
    padding: 5,
    overflow: "hidden",
  },
  sliderHandle: {
    justifyContent: "center",
    alignItems: "center",
    width: INITIAL_BOX_SIZE,
    height: INITIAL_BOX_SIZE,
    backgroundColor: "#f8f9ff",
    borderRadius: 20,
    position: "absolute",
  },
  textContainer: {
    position: "absolute",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  text: {
    color: "#000408",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default GoOnlineSlider;
