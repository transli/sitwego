import React, { useEffect, memo, useMemo } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useRideRequestStatus } from "~/lib/Providers/UseRideRequestProvider";
import ReText from "~/ui/retext";

const TimerComponent: React.FC<{}> = ({}) => {
  const { rideStatus } = useRideRequestStatus();
  const seconds = useSharedValue(0);
  const formattedTime = useSharedValue("00:00");
  const isRunning = useMemo(
    () => rideStatus?.rideStatus?.hasDriverArrived,
    [rideStatus?.rideStatus?.hasDriverArrived],
  );

  useEffect(() => {
    const updateFormattedTime = () => {
      "worklet";
      const minutes = Math.floor(seconds.value / 60);
      const remainingSeconds = seconds.value % 60;
      formattedTime.value = `${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    };

    let timerId = null;
    if (isRunning) {
      timerId = setInterval(() => {
        seconds.value += 1;
        runOnJS(updateFormattedTime)();
      }, 1000);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [formattedTime, isRunning, seconds]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withTiming(isRunning ? 1.1 : 1, { duration: 300 }),
      },
    ],
  }));

  return (
    <Animated.View style={[animatedStyle]}>
      <ReText text={formattedTime} style={styles.timerText} />
    </Animated.View>
  );
};

export default memo(TimerComponent);

const styles = StyleSheet.create({
  timerText: {
    fontSize: 18,
    color: "#f0f0f0",
    fontWeight: "bold",
    textAlign: "center",
  },
});
