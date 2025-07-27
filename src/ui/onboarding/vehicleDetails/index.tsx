import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { Controller, useForm } from "react-hook-form";

import RnText from "~/components/RnText";
import { RnView } from "~/components/RnView";
import { OnboardingControls } from "~/ui/onboarding/OnBoardingControls";
import { s } from "~/styles/Common-Styles";
import { atoms } from "~/ui/theme/atoms";
import { useAppTheme } from "~/ui/theme/ThemeProvider";
import { Pressable } from "react-native-gesture-handler";
import { useCallback, useRef } from "react";
import { useOnboardingControls } from "../state";
import RnTextInput from "~/components/RnTextInput";

type VehicleFormData = {
  vehicleType: string;
  make: string;
  model: string;
  year: string;
  // vin?: string;
  licensePlate: string;
  color: string;
};

export function VehicleDetails() {
  const insets = useSafeAreaInsets();
  const { dispatch } = useOnboardingControls();
  const pickerRef = useRef(null);
  const { colors, fonts } = useAppTheme();
  const { control, getValues } = useForm<VehicleFormData>();
  const onContinue = useCallback(() => {
    const values = getValues();
    dispatch({
      type: "setVehicleDetails",
      vehicleDetails: { ...values },
      apiResponse: undefined,
    });
    dispatch({ type: "next" });
  }, [dispatch, getValues]);
  return (
    <RnView style={[s.align_start, s.justifyBetween]}>
      <RnView
        style={[
          s.w100pct,
          atoms.gap_sm,
          s.flexCol,
          { flexWrap: "wrap", marginTop: insets.top },
        ]}
      >
        <RnText style={[atoms.text_xl]}>Account Setup</RnText>
        <RnText
          style={[{ lineHeight: 20, fontSize: 14, color: colors.lightGray }]}
        >
          Provide Vehicle Details
        </RnText>
      </RnView>
      <RnView style={{ marginVertical: 10 }} />
      <RnView style={[s.w100pct, s.flex1, s.flexCol, s.gap16]}>
        <RnText>
          Vehicle type required{" "}
          <RnText style={{ color: colors.notification, fontSize: 18 }}>
            *
          </RnText>
        </RnText>
        <RnView
          style={[
            {
              borderWidth: 1,
              borderColor: colors.lightBackground,
              borderRadius: 8,
            },
            s.py4,
            s.px4,
          ]}
        >
          <Controller
            name="vehicleType"
            rules={{ required: true }}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Picker
                ref={pickerRef}
                mode="dropdown"
                selectedValue={value}
                onValueChange={(itemValue) => {
                  if (itemValue) {
                    onChange(itemValue);
                  }
                }}
              >
                <Picker.Item
                  style={{ fontSize: 20, fontFamily: fonts.medium.fontFamily }}
                  label="Boda"
                  value="bike"
                />
                <Picker.Item
                  style={{ fontSize: 20, fontFamily: fonts.medium.fontFamily }}
                  label="Car"
                  value="Cab"
                />
              </Picker>
            )}
          />
        </RnView>
        {/* Make brand */}
        <RnView style={[s.gap8]}>
          <RnText>
            What is your vehicle brand / make{" "}
            <RnText style={{ color: colors.notification, fontSize: 18 }}>
              *
            </RnText>
          </RnText>
          <Controller
            name="make"
            rules={{ required: true }}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <RnTextInput
                style={[
                  s.input,
                  s.f16,
                  s.w100pct,
                  {
                    fontFamily: fonts.regular.fontFamily,
                    color: colors.text,
                    borderColor: colors.lightBackground,
                  },
                ]}
                autoCorrect={false}
                cursorColor={colors.lightBackground}
                autoCapitalize="words"
                inputMode="text"
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Toyota"
                placeholderTextColor={colors.lightGray}
                value={value}
              />
            )}
          />
        </RnView>
        <RnView style={[s.gap8]}>
          <RnText>
            What is your vehicle model
            <RnText style={{ color: colors.notification, fontSize: 18 }}>
              *
            </RnText>
          </RnText>
          <Controller
            name="model"
            rules={{ required: true }}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <RnTextInput
                style={[
                  s.input,
                  s.f16,
                  s.w100pct,
                  {
                    fontFamily: fonts.regular.fontFamily,
                    color: colors.text,
                    borderColor: colors.lightBackground,
                  },
                ]}
                autoCorrect={false}
                cursorColor={colors.lightBackground}
                autoCapitalize="words"
                inputMode="text"
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Camry"
                placeholderTextColor={colors.lightGray}
                value={value}
              />
            )}
          />
        </RnView>
        <RnView style={[s.gap8]}>
          <RnText>
            What is your vehicle license plate number
            <RnText style={{ color: colors.notification, fontSize: 18 }}>
              *
            </RnText>
          </RnText>
          <Controller
            name="licensePlate"
            rules={{ required: true }}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <RnTextInput
                style={[
                  s.input,
                  s.f16,
                  s.w100pct,
                  {
                    fontFamily: fonts.regular.fontFamily,
                    color: colors.text,
                    borderColor: colors.lightBackground,
                  },
                ]}
                autoCorrect={false}
                cursorColor={colors.lightBackground}
                autoCapitalize="words"
                inputMode="text"
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="KDY 564B"
                placeholderTextColor={colors.lightGray}
                value={value}
              />
            )}
          />
        </RnView>
        <RnView style={[s.gap8]}>
          <RnText>
            What is your vehicle color
            <RnText style={{ color: colors.notification, fontSize: 18 }}>
              *
            </RnText>
          </RnText>
          <Controller
            name="color"
            rules={{ required: true }}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <RnTextInput
                style={[
                  s.input,
                  s.f16,
                  s.w100pct,
                  {
                    fontFamily: fonts.regular.fontFamily,
                    color: colors.text,
                    borderColor: colors.lightBackground,
                  },
                ]}
                autoCorrect={false}
                cursorColor={colors.lightBackground}
                autoCapitalize="words"
                inputMode="text"
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="White"
                placeholderTextColor={colors.lightGray}
                value={value}
              />
            )}
          />
        </RnView>
      </RnView>
      <OnboardingControls.Portal>
        <RnView
          style={[
            { marginBottom: insets.bottom },
            s.justifyCenter,
            s.alignCenter,
            s.py8,
          ]}
        >
          <Pressable
            onPress={onContinue}
            style={[
              s.p16,
              {
                width: "80%",
                backgroundColor: colors.primary,
                borderRadius: 8,
              },
            ]}
          >
            <RnText style={[atoms.text_lg, s.textCenter]}>Continue</RnText>
          </Pressable>
        </RnView>
      </OnboardingControls.Portal>
    </RnView>
  );
}
