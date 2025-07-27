import React, { useCallback, useMemo, useState } from "react";
import { Pressable } from "react-native-gesture-handler";
import {
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { PhoneInput, isValidNumber } from "react-native-phone-entry";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RnText from "~/components/RnText";
import { RnAnimatedView, RnView } from "~/components/RnView";
import { useAppTheme } from "~/ui/theme/ThemeProvider";
import { atoms } from "~/ui/theme/atoms";
import Icon from "~/components/Icons";
import { s } from "~/styles/Common-Styles";
import { KeyboardAvoidingView } from "react-native";

type Props = {
  setPhoneNumber: (phone: string) => void;
  isOpen: boolean;
  close: () => void;
};
export const PhoneModal: React.FC<Props> = ({
  setPhoneNumber,
  isOpen,
  close,
}) => {
  const { colors, fonts } = useAppTheme();
  const openAnimValue = useSharedValue(isOpen ? 1 : 0);
  const { top, bottom } = useSafeAreaInsets();
  const [phone, setPhone] = useState<string | undefined>();

  React.useEffect(() => {
    openAnimValue.value = withTiming(isOpen ? 1 : 0, { duration: 300 });
  }, [isOpen, openAnimValue]);

  const drawerContainerProps = useAnimatedProps(() => ({
    pointerEvents:
      openAnimValue.value === 1 ? ("auto" as const) : ("none" as const),
  }));

  const modalStyle = useAnimatedStyle(() => ({
    height: `${interpolate(openAnimValue.value, [0, 1], [0, 100])}%`,
    transform: [
      {
        translateY: interpolate(openAnimValue.value, [0, 1], [90, 0]),
      },
    ],
    position: "absolute",
    display: "flex",
    top: top,
    bottom: bottom,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
  }));

  const _isValidPhone = useMemo(() => {
    return phone && isValidNumber(phone, "KE");
  }, [phone]);

  const _onPhoneTextChage = useCallback((phone: string) => {
    setPhone(phone);
  }, []);
  const _setPhoneNumber = useCallback(() => {
    if (phone && isValidNumber(phone, "KE")) {
      setPhoneNumber(phone);
      close();
    } else {
      // Handle invalid phone number case
      console.warn("Invalid phone number");
    }
  }, [phone, setPhoneNumber, close]);

  return (
    <RnAnimatedView animatedProps={drawerContainerProps} style={[modalStyle]}>
      <KeyboardAvoidingView behavior="padding" style={[s.flex1]}>
        {isOpen && (
          <>
            <RnView style={[s.p16]}>
              <RnView
                style={[s.w100pct, s.flexDirectionRow, s.pt10, { gap: "32%" }]}
              >
                <Pressable onPress={close} style={[]}>
                  <Icon
                    name="ArrowLeft"
                    size={32}
                    strokeWidth={2.5}
                    color={colors.text}
                  />
                </Pressable>
                <RnView style={[s.alignSelf]}>
                  <RnText style={{ textAlign: "center" }}>Title</RnText>
                </RnView>
              </RnView>
              <RnView style={{ marginVertical: 20 }} />
              <RnText>Mobile</RnText>
              <RnView style={{ marginVertical: 20 }} />
              <PhoneInput
                defaultValues={{
                  countryCode: "KE",
                  callingCode: "+254",
                  phoneNumber: "+254",
                }}
                value={phone}
                onChangeText={_onPhoneTextChage}
                onChangeCountry={(country) => console.log("Country:", country)}
                autoFocus={true}
                disabled={false}
                countryPickerProps={{
                  countryCode: "KE",
                  onSelect: (country) =>
                    console.log("Selected country:", country),
                }}
                theme={{
                  containerStyle: {
                    backgroundColor: colors.background,
                    borderColor: colors.lightBackground,
                    borderRadius: 8,
                    height: 50,
                  },
                  textInputStyle: {
                    color: colors.text,
                    paddingHorizontal: 5,
                    fontFamily: fonts.regular.fontFamily,
                    ...atoms.text_2xl,
                  },
                  flagButtonStyle: {
                    borderRightWidth: 0,
                    width: undefined,
                  },
                  codeTextStyle: {
                    fontFamily: fonts.heavy.fontFamily,
                  },
                  enableDarkTheme: true,
                }}
                hideDropdownIcon={true}
                isCallingCodeEditable={false}
              />
            </RnView>
            <RnView
              style={[s.flex1, s.justifyFlexEnd, { marginBottom: bottom * 2 }]}
            >
              <RnView
                style={[
                  s.flexDirectionRow,
                  s.justifyCenter,
                  s.gap16,
                  { flexWrap: "wrap" },
                ]}
              >
                <RnText>Send me a verification code</RnText>
                <Pressable
                  style={[
                    s.p16,
                    s.alignCenter,
                    {
                      borderRadius: 8,
                      backgroundColor: _isValidPhone
                        ? colors.primary
                        : colors.lightBackground,
                      width: "90%",
                    },
                  ]}
                  onPress={_setPhoneNumber}
                  disabled={!_isValidPhone}
                >
                  <RnText>Send Otp</RnText>
                </Pressable>
              </RnView>
            </RnView>
          </>
        )}
      </KeyboardAvoidingView>
    </RnAnimatedView>
  );
};
