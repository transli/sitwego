import React, { memo, useCallback } from "react";
import { DeviceEventEmitter, StyleSheet } from "react-native";
import { RnView, RnAnimatedView } from "~/components/RnView";
import RnText from "~/components/RnText";
import Icon from "~/components/Icons";
import { useAppTheme } from "~/ui/theme/ThemeProvider";
import { themes } from "~/ui/theme/theme_utils";
import { atoms } from "~/ui/theme/atoms";
import SwipeSlider from "~/ui/SliderButton";
import { width } from "~/utils/metrics/dimm";

interface Props {}
function CollectCashAndConfirmRideEnded({ navigation }) {
  const { colors, fonts } = useAppTheme();
  const handlePaymentConfirmation = useCallback(async () => {
    //TODO::
    // emit event to show rating modal
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
    DeviceEventEmitter.emit("onRideComplete", true);
  }, [navigation]);
  return (
    <RnAnimatedView style={[styles.container]}>
      <RnView style={[styles.paymentD, atoms.gap_md]}>
        <RnText style={[atoms.text_lg, { fontFamily: fonts.heavy.fontFamily }]}>
          KES 540
        </RnText>
        <Icon
          name="Banknote"
          size={35}
          strokeWidth={2}
          color={themes.green_500}
        />
      </RnView>
      <RnView style={[styles.vertSpace]}>
        <RnText
          style={[atoms.text_sm, { fontFamily: fonts.regular.fontFamily }]}
        >
          Collect Cash
        </RnText>
      </RnView>
      <RnView>
        <SwipeSlider
          onSwipeComplete={handlePaymentConfirmation}
          initialTrackColor={themes.green_400}
          completeTrackColor={themes.green_600}
          sliderBackgroundColor={colors.text}
          textColor={colors.text}
          initialText="Confirm Payment"
          completeText="Cash Collected"
          endIcon={<Icon name="HandCoins" size={24} color={themes.green_600} />}
          startIcon={
            <Icon name="ChevronsRight" size={24} color={themes.green_400} />
          }
          borderRadius={16}
          sliderTrackWidth={width * 0.8}
          sliderSize={50}
          sliderTrackHeight={50}
          enableHaptics={true}
          reduceMotion="never"
        />
      </RnView>
    </RnAnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentD: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  vertSpace: {
    marginVertical: 10,
  },
});

export default memo(CollectCashAndConfirmRideEnded);
