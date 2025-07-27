import React, { useCallback, useMemo, useRef } from "react";
import { View, StyleSheet } from "react-native";
import RnText from "~/components/RnText";
import PickupToDestination from "~/components/route/PickUpDropOff-Indicator";
import { atoms } from "../theme/atoms";
import { themes } from "../theme/theme_utils";
import { useAppTheme } from "../theme/ThemeProvider";
import Icon from "~/components/Icons";
import { useBottomSheet } from "~/components/RnBottomSheet/BottomSheetProvider";
import { Pressable } from "react-native-gesture-handler";
import { useRideRequestStatus } from "~/lib/Providers/UseRideRequestProvider";
import TimerComponent from "~/components/TimerComponent";
import SwipeSlider from "../SliderButton";
import { width } from "~/utils/metrics/dimm";
type Props = {
  showOtpSheet: () => void;
  hasRideStarted: boolean;
  setArrived: () => void;
  endRide: () => Promise<void>;
};

export const UpcomingRideInfo: React.FC<Props> = function UpcomingRideInfo({
  showOtpSheet,
  hasRideStarted,
  endRide,
  setArrived,
}) {
  const { colors, fonts } = useAppTheme();
  const { hide } = useBottomSheet();
  const { rideStatus, setRideStatus } = useRideRequestStatus();
  const onCanceltRideRequest = useCallback(async () => {
    console.log("Ride request cancelled");
    hide();
  }, [hide]);
  const setDriverArived = useCallback(() => {
    return setRideStatus({
      type: "UPDATE_RIDE_STATUS",
      payload: {
        hasDriverArrived: true,
      },
    });
  }, [setRideStatus]);
  console.log("RIDE_REQUEST_STATUS", rideStatus?.rideStatus.hasDriverArrived);
  const hasDriverArrived = useMemo(
    () => rideStatus?.rideStatus.hasDriverArrived,
    [rideStatus?.rideStatus.hasDriverArrived],
  );
  const handlePaymentComplete = useCallback(async () => {
    await endRide();
    console.log("RIDE ENDED BY DRIVER");
  }, [endRide]);
  return (
    <View style={[styles.UP_container, {}]}>
      <View style={[styles.Up_rideData, { backgroundColor: themes.bg_900 }]}>
        <RnText
          style={[
            styles.Up_title,
            atoms.text_lg,
            { left: 10, fontFamily: fonts.heavy.fontFamily },
          ]}
        >
          Ride XXX-XXX
        </RnText>
        <View style={[styles.Up_eta_container]}>
          <View style={[styles.ETA_info_view, atoms.gap_xs]}>
            <Icon
              name="Hourglass"
              size={16}
              strokeWidth={2}
              color={themes.bg_400}
            />
            <TimerComponent />
            {/* <RnText
              style={[
                atoms.text_sm,
                styles.ETA_time,
                { fontFamily: fonts.regular.fontFamily },
              ]}
            >
              0:00
            </RnText> */}
          </View>
          <View style={[styles.ETA_info_view, atoms.gap_xs]}>
            <Icon
              name="Waypoints"
              size={16}
              strokeWidth={2}
              color={themes.bg_400}
            />
            <RnText
              style={[
                atoms.text_sm,
                styles.ETA_time,
                { fontFamily: fonts.regular.fontFamily },
              ]}
            >
              10Km
            </RnText>
          </View>
          <View style={[styles.ETA_info_view, atoms.gap_xs]}>
            <Icon
              name="HandCoins"
              size={16}
              strokeWidth={2}
              color={themes.bg_400}
            />
            <RnText
              style={[
                atoms.text_sm,
                styles.ETA_time,
                { fontFamily: fonts.regular.fontFamily },
              ]}
            >
              240 KES
            </RnText>
          </View>
        </View>
      </View>
      <View style={[styles.Up_rideData, { backgroundColor: themes.bg_900 }]}>
        <PickupToDestination />
      </View>
      {!hasRideStarted && (
        <View style={[styles.Up_rideData]}>
          <Pressable
            onPress={hasDriverArrived ? showOtpSheet : setDriverArived}
            android_ripple={{}}
            style={[
              styles.START_button,
              {
                backgroundColor: themes.primary_600,
                width: "95%",
                zIndex: 999,
              },
            ]}
          >
            {hasDriverArrived ? (
              <RnText>Start Ride</RnText>
            ) : (
              <RnText style={{ textAlign: "center" }}>
                Arrived at pick up location?
              </RnText>
            )}
          </Pressable>
        </View>
      )}
      <View
        style={[
          !hasRideStarted ? atoms.flex_1 : atoms.flex_0,
          { justifyContent: "flex-end" },
        ]}
      >
        <View style={[styles.Up_rideData]}>
          {!hasRideStarted ? (
            <Pressable
              onPress={onCanceltRideRequest}
              style={[
                styles.START_button,
                {
                  backgroundColor: themes.red_600,
                  width: "95%",
                  zIndex: 999,
                },
              ]}
            >
              <RnText>Cancel Request</RnText>
            </Pressable>
          ) : (
            <SwipeSlider
              onSwipeComplete={handlePaymentComplete}
              initialTrackColor={themes.red_400}
              completeTrackColor={themes.red_500}
              sliderBackgroundColor={colors.text}
              textColor={colors.text}
              initialText="Slide to End the ride"
              completeText="Ride Completed"
              endIcon={
                <Icon name="HandCoins" size={24} color={themes.red_500} />
              }
              startIcon={
                <Icon name="ChevronsRight" size={24} color={themes.red_400} />
              }
              borderRadius={16}
              sliderTrackWidth={width * 0.9}
              sliderSize={50}
              sliderTrackHeight={50}
              enableHaptics={true}
              reduceMotion="never"
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  UP_container: {
    flex: 1,
    paddingVertical: 10,
  },
  Up_rideData: {
    marginBottom: 8,
    paddingVertical: 5,
    borderRadius: 16,
  },
  Up_title: {},
  Up_route_text: {
    color: themes.bg_300,
  },
  Up_eta_container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  ETA_info_view: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  ETA_icon: {},
  ETA_time: {
    color: themes.bg_300,
  },
  START_button: {
    padding: 14,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 10,
  },
});
