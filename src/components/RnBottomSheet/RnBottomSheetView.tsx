import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { SizeInfo, TrueSheet } from "@lodev09/react-native-true-sheet";
import { ACTBottomSheetProps } from "./BottomSheetProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "~/ui/theme/ThemeProvider";
import {
  DeviceEventEmitter,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { useDragChangeHandler } from "~/hooks/useOndrugHundler";
import RnText from "../RnText";
import { atoms } from "~/ui/theme/atoms";
import Icon from "../Icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { generateGoogleMapsNavigationLink } from "~/utils/navigation";
import { ChatBottomSheet } from "./ChatBottomSheet";
import { OtpBottomSheet } from "./OtpBottomSheet";
import {
  useRideRequest,
  useRideRequestStatus,
} from "~/lib/Providers/UseRideRequestProvider";
import { RideNotificationType } from "~/types/rideRequstTypes";
import { delay } from "~/utils/await_timer";

import {
  useCreateRideRequestMutation,
  useEndrideRequestMutation,
} from "~/hooks/useRideApi";
import { useNavigation } from "@react-navigation/native";

const AnimatedTrueSheet = Animated.createAnimatedComponent(TrueSheet);
interface Props {
  children: React.ReactNode;
}
const $content = StyleSheet.create({
  bottomSheetContainer: {
    paddingTop: 10,
    paddingHorizontal: 10,
    overflow: "hidden",
    flexGrow: 1,
    flexBasis: "100%",
  },
});

const DARK_GRAY = "#333b48";
const RnBottomSheetView = forwardRef(({ children }: Props, ref) => {
  const sheetRef = useRef<TrueSheet>(null);
  const chatSheetRef = useRef<TrueSheet>(null);
  const navigation = useNavigation();
  const otpSheetRef = useRef<TrueSheet>(null);
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<ACTBottomSheetProps>();
  const { rideStatus, setRideStatus } = useRideRequestStatus();
  const { mutateAsync: _endRide, isPending } = useEndrideRequestMutation();
  const { mutateAsync: startRide, isPending: isStartingRide } =
    useCreateRideRequestMutation();
  const { colors } = useAppTheme();
  const { rideState } = useRideRequest();

  const hasRideStarted = useMemo(
    () => rideStatus?.rideStatus?.hasRideStarted,
    [rideStatus?.rideStatus?.hasRideStarted],
  );

  const buttonY = useSharedValue(0);

  const dragChangeHandler = useDragChangeHandler((sizeInfo: SizeInfo) => {
    "worklet";
    buttonY.value = -sizeInfo.value;
  });

  useImperativeHandle(ref, () => ({
    show,
    hide,
  }));
  const show = useCallback(
    async (props: React.SetStateAction<ACTBottomSheetProps | undefined>) => {
      setData(props);
      if (sheetRef.current) {
        await delay(300);
        console.log("SHOW RIDE REQUEST MODAL");
        await sheetRef.current.present(0);
      }
    },
    [],
  );

  const ride = useMemo(() => {
    return (rideState as { ride: RideNotificationType })?.ride;
  }, [rideState]);

  const hide = useCallback(async () => await sheetRef.current?.dismiss(), []);

  const onClose = useCallback(() => {
    data?.onClose && data?.onClose();
    buttonY.value = 0;
  }, [buttonY, data]);

  const controlls_style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: buttonY.value },
        {
          scale: interpolate(
            buttonY.value,
            [0, -20], // Input range
            [0, 1], // Output range (scale from 1 to 0)
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }, //To prevent overshooting
          ),
        },
      ],
    };
  }, [buttonY]);

  const animateButton = (sizeInfo: SizeInfo) => {
    buttonY.value = withSpring(-sizeInfo.value, SPRING_CONFIG);
  };

  const onOpenNaviagation = useCallback(async () => {
    const dropOff = ride.data?.ride_line_str?.[0];
    if (!dropOff) return;
    const navUrl = generateGoogleMapsNavigationLink(
      { lat: dropOff.latitude, lng: dropOff.longitude },
      {
        travelMode: "d",
      },
    );
    try {
      const supported = await Linking.canOpenURL(navUrl);
      if (supported) {
        await Linking.openURL(navUrl);
      } else {
        console.log("Don't know how to open URI: " + navUrl);
      }
    } catch (error) {
      console.log("Error opening navigation:", error);
    }
  }, [ride?.data?.ride_line_str]);

  const onMount = useCallback(() => {}, []);
  const openChatSheet = useCallback(async () => {
    await chatSheetRef.current?.present();
  }, []);

  const showOtpSheet = useCallback(async () => {
    await otpSheetRef.current?.present();
  }, []);

  const confirmOtp = useCallback(
    async (otp: string) => {
      await startRide({ start_otp: otp });
      console.log("START OTP CODE IS:", otp);
      sheetRef.current?.resize(0);
      return setRideStatus({
        type: "UPDATE_RIDE_STATUS",
        payload: {
          hasRideStarted: true,
          hasDriverArrived: false,
          hasRideCanceled: false,
        },
      });
    },
    [setRideStatus, startRide],
  );

  const endRide = useCallback(async () => {
    await _endRide({
      last_location: {
        latitude: -1.284006520078879,
        longitude: 36.82543783978153,
      },
    });
    console.log("RIDE COMPLETED!!!");
    await hide();
    DeviceEventEmitter.emit("onRideCompleted", true);
    //@ts-ignore
    navigation.navigate("CollectCashAndConfirmRideEnded", {});
  }, [_endRide, hide, navigation]);

  const setArrived = useCallback(() => {}, []);

  const renderComponent = useMemo(
    () =>
      data?.cmp
        ? data.cmp({ showOtpSheet, hasRideStarted, endRide, setArrived })
        : null,
    [endRide, data, hasRideStarted, setArrived, showOtpSheet],
  );
  return (
    <>
      {children}
      <Animated.View
        style={[
          {
            position: "absolute",
            flexDirection: "row",
            justifyContent: "space-between",
            alignSelf: "center",
            bottom: 10,
            flex: 1,
            width: "91%",
          },
          controlls_style,
        ]}
      >
        {!hasRideStarted && (
          <View
            style={[
              atoms.gap_lg,
              {
                flexDirection: "row",
                alignItems: "center",
              },
            ]}
          >
            <Pressable
              onPress={() => {}}
              style={[$CTRL_styles.CTRL_contact_view]}
            >
              <Icon
                strokeWidth={2.5}
                name="Phone"
                size={30}
                color={colors.primary}
              />
            </Pressable>
            <Pressable
              onPress={openChatSheet}
              style={[$CTRL_styles.CTRL_contact_view]}
            >
              <Icon
                strokeWidth={2.4}
                name="MessageCircle"
                size={30}
                color={colors.primary}
              />
            </Pressable>
          </View>
        )}
        <View style={[atoms.flex_1]}>
          <Pressable
            onPress={onOpenNaviagation}
            style={[
              $CTRL_styles.CTRL_contact_navigation,
              { backgroundColor: colors.primary },
            ]}
          >
            <Icon
              strokeWidth={2}
              name="Navigation"
              size={24}
              color={colors.text}
            />
            <RnText style={[atoms.text_sm]}>Map</RnText>
          </Pressable>
        </View>
      </Animated.View>
      <React.Fragment>
        <AnimatedTrueSheet
          sizes={["45%", "70%"]}
          ref={sheetRef}
          contentContainerStyle={[
            $content.bottomSheetContainer,
            { marginBottom: insets.bottom },
          ]}
          dimmedIndex={1}
          blurTint="dark"
          dismissible={false}
          edgeToEdge
          backgroundColor={colors.background}
          cornerRadius={20}
          onDragChange={dragChangeHandler}
          grabberProps={{ color: DARK_GRAY }}
          onDismiss={onClose}
          onPresent={(e) => animateButton(e.nativeEvent)}
          onSizeChange={(e) => animateButton(e.nativeEvent)}
          onDragEnd={(e) => animateButton(e.nativeEvent)}
          onMount={onMount}
        >
          <GestureHandlerRootView style={{ flexGrow: 1 }}>
            {renderComponent}
          </GestureHandlerRootView>
          <ChatBottomSheet ref={chatSheetRef} />
          <OtpBottomSheet confirmOtpCodes={confirmOtp} ref={otpSheetRef} />
        </AnimatedTrueSheet>
      </React.Fragment>
    </>
  );
});
export default RnBottomSheetView;
RnBottomSheetView.displayName = "RnBottomSheetView";

const $CTRL_styles = StyleSheet.create({
  CTRL_contact_view: {
    width: 48,
    height: 35,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    backgroundColor: "white",
  },
  CTRL_contact_navigation: {
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 24,
    alignSelf: "flex-end",
  },
});
export const SPRING_CONFIG: WithSpringConfig = {
  damping: 500,
  stiffness: 1000,
  mass: 3,
  overshootClamping: true,
  restDisplacementThreshold: 10,
  restSpeedThreshold: 10,
};
