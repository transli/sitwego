import { ViewProps, StyleSheet, View } from "react-native";
import { RnAnimatedView, RnView } from "./RnView";
import React, {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useAppTheme } from "~/ui/theme/ThemeProvider";
import {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  interpolate,
  AnimatedProps,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { height } from "~/utils/metrics/dimm";
import PickupToDestination from "./route/PickUpDropOff-Indicator";
import { Pressable } from "react-native-gesture-handler";
import Icon from "./Icons";
import Avatar from "./Avatar";
import RnText from "./RnText";
import { atoms } from "~/ui/theme/atoms";
import { useBottomSheet } from "./RnBottomSheet/BottomSheetProvider";
import { UpcomingRideInfo } from "~/ui/Views/UpcomingRide";
import ProgressBarTimer from "./RequestTimeout";
import { RideNotificationType } from "~/types/rideRequstTypes";
import { useRideRequest } from "~/lib/Providers/UseRideRequestProvider";
import { rideStore } from "~/lib/store";
import { useAcceptRideRequestMutation } from "~/hooks/useRideApi";

const BackDropView: React.FC<
  AnimatedProps<ViewProps> & { close: () => void }
> = ({ close, ...rest }) => {
  const { colors } = useAppTheme();
  const { top } = useSafeAreaInsets();
  return (
    <RnAnimatedView
      {...rest}
      style={[
        {
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: "transparent",
          zIndex: 0,
        },
      ]}
    >
      <Pressable
        onPress={close}
        style={{
          top: top + 16,
          right: 16,
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
          width: 48,
          height: 48,
          zIndex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          borderRadius: 24,
        }}
      >
        <Icon name="X" size={26} strokeWidth={2} color={colors.text} />
      </Pressable>
    </RnAnimatedView>
  );
};

/** Just for debugging */
const initialIsModalOpened = false;
interface Props {
  children: React.ReactNode | React.ReactElement;
}
const RequestNotificationModal = React.forwardRef(
  ({ children }: Props, ref) => {
    const { colors, fonts } = useAppTheme();
    const insets = useSafeAreaInsets();
    const { rideState, removeRide, setRide } = useRideRequest();
    const { mutateAsync: accepRideRequset, isPending } =
      useAcceptRideRequestMutation();
    const ride = useMemo(() => {
      return (rideState as { ride: RideNotificationType })?.ride;
    }, [rideState]);

    useImperativeHandle(ref, () => ({
      open: onRequestPress,
      close: closeModal,
    }));
    const openAnimValue = useSharedValue(initialIsModalOpened ? 1 : 0);
    const { show } = useBottomSheet();
    const getIsModalOpened = useCallback(
      () => openAnimValue.value === 1,
      [openAnimValue],
    );

    const backdropProps = useAnimatedProps(() => ({
      pointerEvents:
        openAnimValue.value === 1 ? ("auto" as const) : ("box-none" as const),
    }));

    const drawerContainerProps = useAnimatedProps(() => ({
      pointerEvents:
        openAnimValue.value === 1 ? ("auto" as const) : ("none" as const),
    }));

    const translateYStyle = useAnimatedStyle(() => ({
      transform: [
        {
          translateY: interpolate(openAnimValue.value, [0, 1, 2], [90, 0, 90]),
        },
      ],
    }));
    const opacityStyle = useAnimatedStyle(() => ({
      opacity: interpolate(openAnimValue.value, [0, 1, 2], [0, 1, 0]),
    }));
    const maxHeight = height - insets.bottom - insets.top;

    const [isOpened, setIsOpened] = useState(false);

    const openModal = useCallback(() => {
      setIsOpened(true);

      openAnimValue.value = 0;
      openAnimValue.value = withTiming(1, { duration: 400 }, (finished) => {
        if (finished) {
          // Do something when the animation is finished
        }
      });
    }, [openAnimValue]);

    const closeModal = useCallback(() => {
      const animCallback = async () => {
        setIsOpened(false);
      };
      openAnimValue.value = withTiming(2, { duration: 400 }, (finished) => {
        if (finished) {
          openAnimValue.value = 0;
          runOnJS(animCallback)();
        }
      });
    }, [openAnimValue]);

    const onRequestPress = useCallback(() => {
      if (getIsModalOpened()) {
        closeModal();
      } else {
        openModal();
      }
    }, [getIsModalOpened, closeModal, openModal]);

    const onAcceptRideRequest = useCallback(async () => {
      closeModal();
      const ride_data = {
        ...ride,
        opened: true,
      } as RideNotificationType;
      setRide(ride_data);
      rideStore.set(["ride"], {
        ride: ride_data,
      });
      await accepRideRequset({
        ride_id: ride_data.id,
        from: ride_data.data.from.geo_point,
        to: ride_data.data.to.geo_point,
      });
    }, [accepRideRequset, closeModal, ride, setRide]);

    const onCancelRideRequest = useCallback(async () => {
      removeRide();
      closeModal();
    }, [removeRide, closeModal]);

    useEffect(() => {
      if (!getIsModalOpened() && ride?.opened) {
        console.log("CAN_OPPEN_BOTTOM_SHEET", ride?.opened);
        show({
          hasBackDrop: true,
          hasCancel: true,
          snaps: ["50%", height * 0.5 + 56],
          enablePanDownToClose: true,
          cmp: (props) => <UpcomingRideInfo {...props} />,
        });
      }
    }, [getIsModalOpened, ride, show]);

    useEffect(() => {
      if (!ride || !ride?.data) return;
      console.log("Ride Request Notification Data Changed:-", ride?.opened);
      if (!ride?.opened) {
        onRequestPress();
      }
    }, [onRequestPress, ride]);
    return (
      <React.Fragment>
        {children}
        {isOpened && (
          <>
            <BackDropView
              close={onCancelRideRequest}
              animatedProps={backdropProps}
              style={opacityStyle}
            />

            <RnAnimatedView
              animatedProps={drawerContainerProps}
              style={[
                opacityStyle,
                translateYStyle,
                {
                  width: "100%",
                  display: "flex",
                  maxHeight: maxHeight,
                  paddingHorizontal: 10,
                  paddingTop: insets.top - 10,
                  paddingBottom: insets.bottom + 16 + 50,
                  alignSelf: "flex-end",
                  justifyContent: "flex-end",
                  position: "absolute",
                  bottom: 0,
                  backgroundColor: colors.background,
                  borderTopRightRadius: 16,
                  borderTopLeftRadius: 16,
                },
              ]}
            >
              <RnView
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  flexDirection: "column",
                }}
              >
                <View
                  style={[
                    atoms.gap_md,
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 8,
                    },
                  ]}
                >
                  <RnText
                    style={[
                      atoms.text_md,
                      { fontFamily: fonts.heavy.fontFamily },
                    ]}
                  >
                    450Ksh
                  </RnText>

                  <RnText
                    style={[
                      atoms.text_xl,
                      {
                        fontFamily: fonts.heavy.fontFamily,
                        color: colors.lightGray,
                      },
                    ]}
                  >
                    Swift
                  </RnText>
                </View>
                <ProgressBarTimer duration={20} close={onCancelRideRequest} />
              </RnView>
              <RnView style={[styles.content_view]}>
                <PickupToDestination />
                <RnView style={{ marginBottom: 16 }} />
                <RnView style={[styles.USER_details]}>
                  <RnView
                    style={[
                      {
                        flexDirection: "row",
                        alignContent: "center",
                        alignItems: "flex-start",
                        justifyContent: "center",
                      },
                      atoms.gap_xs,
                    ]}
                  >
                    <Avatar
                      size={35}
                      avatar="https://yt3.ggpht.com/yti/ANjgQV86NZMzr6J81xCyVAziVjgk_YnN_MbKWG8HsGVugw24FJM=s88-c-k-c0x00ffffff-no-rj"
                      onLoad={() => {}}
                    />
                    <RnText
                      style={[atoms.text_2xs, { color: colors.lightGray }]}
                    >
                      John Ngugi
                    </RnText>
                  </RnView>
                  <RnView
                    style={[
                      {
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      },
                      atoms.gap_xs,
                    ]}
                  >
                    <Icon name="Star" size={24} color={colors.lightGray} />
                    <RnText
                      style={[atoms.text_2xs, { color: colors.lightGray }]}
                    >
                      4.6
                    </RnText>
                  </RnView>
                </RnView>
              </RnView>
            </RnAnimatedView>
            <Pressable
              onPress={onAcceptRideRequest}
              android_ripple={{}}
              style={[
                {
                  padding: 14,
                  width: "95%",
                  alignSelf: "center",
                  borderRadius: 16,
                  bottom: insets.bottom + 5,
                  backgroundColor: colors.primary,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <RnText style={[{ fontFamily: fonts.regular.fontFamily }]}>
                ACCEPT REQUEST
              </RnText>
            </Pressable>
          </>
        )}
      </React.Fragment>
    );
  },
);
RequestNotificationModal.displayName = "RequestNotificationModal";
export default memo(RequestNotificationModal);

const styles = StyleSheet.create({
  content_view: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  USER_details: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
