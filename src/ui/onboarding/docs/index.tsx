import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { Controller, useForm } from "react-hook-form";

import RnText from "~/components/RnText";
import { RnView } from "~/components/RnView";
import { s } from "~/styles/Common-Styles";
import { atoms } from "~/ui/theme/atoms";
import { useAppTheme } from "~/ui/theme/ThemeProvider";
import RnTextInput from "~/components/RnTextInput";
import { useCallback, useRef, useState } from "react";
import { DateFieldRef, DateInputField } from "~/ui/DateComponent";
import { TouchableWithoutFeedback } from "react-native";

export function Docs() {
  const { colors, fonts } = useAppTheme();
  const { control, getValues } = useForm();
  const insets = useSafeAreaInsets();
  const dateRef = useRef<DateFieldRef>(null);

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
          Provide Documents
        </RnText>
        <RnView style={[s.flexDirectionRow, { flexWrap: "wrap" }, s.gap6]}>
          <RnText>
            What is your Id Number
            <RnText style={{ color: colors.notification, fontSize: 18 }}>
              *
            </RnText>
          </RnText>
          <Controller
            name="idNo"
            rules={{ required: true }}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <RnTextInput
                style={[
                  s.input,
                  s.f16,
                  s.w100pct,
                  {
                    paddingLeft: 16,
                    fontFamily: fonts.regular.fontFamily,
                    color: colors.text,
                    borderColor: colors.lightBackground,
                  },
                ]}
                autoCorrect={false}
                cursorColor={colors.lightBackground}
                inputMode="numeric"
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="289500000"
                placeholderTextColor={colors.lightGray}
                value={value}
              />
            )}
          />
          <TouchableWithoutFeedback
            onPress={() => {}}
            style={[
              s.w100pct,
              s.alignCenter,
              s.justifyCenter,
              {
                aspectRatio: 16 / 9,
                borderRadius: 16,
                backgroundColor: colors.lightBackground,
              },
            ]}
          >
            <RnText>Take document photo</RnText>
          </TouchableWithoutFeedback>
          <RnView style={{ marginVertical: 0 }} />
          <TouchableWithoutFeedback
            onPress={() => {}}
            style={[
              s.w100pct,
              s.alignCenter,
              s.justifyCenter,
              {
                aspectRatio: 16 / 9,
                borderRadius: 16,
                backgroundColor: colors.lightBackground,
              },
            ]}
          >
            <RnText>Take document photo</RnText>
          </TouchableWithoutFeedback>
        </RnView>
        <RnView style={[s.flexDirectionRow, { flexWrap: "wrap" }, s.gap6]}>
          <RnText>
            Driving License expiry date
            <RnText style={{ color: colors.notification, fontSize: 18 }}>
              *
            </RnText>
          </RnText>
          <Controller
            name="dlExpiry"
            rules={{ required: true }}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <DateInputField
                inputRef={dateRef}
                value={value}
                minimumDate={new Date()}
                onChangeDate={function (date: string): void {
                  onChange(date);
                }}
                label={"Dl expiry date"}
              />
            )}
          />
          <TouchableWithoutFeedback
            onPress={() => {}}
            style={[
              s.w100pct,
              s.alignCenter,
              s.justifyCenter,
              {
                aspectRatio: 16 / 9,
                borderRadius: 16,
                backgroundColor: colors.lightBackground,
              },
            ]}
          >
            <RnText>Take document photo</RnText>
          </TouchableWithoutFeedback>
        </RnView>
        <RnView style={[s.flexDirectionRow, { flexWrap: "wrap" }, s.gap6]}>
          <RnText>
            Clearance Certificate / report expiry date
            <RnText style={{ color: colors.notification, fontSize: 18 }}>
              *
            </RnText>
          </RnText>
          <Controller
            name="V"
            rules={{ required: true }}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <DateInputField
                inputRef={dateRef}
                value={value}
                minimumDate={new Date()}
                onChangeDate={function (date: string): void {
                  onChange(date);
                }}
                label={"Certificate Expiry date"}
              />
            )}
          />
          <TouchableWithoutFeedback
            onPress={() => {}}
            style={[
              s.w100pct,
              s.alignCenter,
              s.justifyCenter,
              {
                aspectRatio: 16 / 9,
                borderRadius: 16,
                backgroundColor: colors.lightBackground,
              },
            ]}
          >
            <RnText>Take document photo</RnText>
          </TouchableWithoutFeedback>
        </RnView>
        <RnView style={[s.flexDirectionRow, { flexWrap: "wrap" }, s.gap6]}>
          <RnText>
            Provide PSV Badge expiry date
            <RnText style={{ color: colors.notification, fontSize: 18 }}>
              *
            </RnText>
          </RnText>
          <Controller
            name="psvBadgeExpiry"
            rules={{ required: true }}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <DateInputField
                inputRef={dateRef}
                value={value}
                minimumDate={new Date()}
                onChangeDate={function (date: string): void {
                  onChange(date);
                }}
                label="PSV badge expiry"
              />
            )}
          />
          <TouchableWithoutFeedback
            onPress={() => {}}
            style={[
              s.w100pct,
              s.alignCenter,
              s.justifyCenter,
              {
                aspectRatio: 16 / 9,
                borderRadius: 16,
                backgroundColor: colors.lightBackground,
              },
            ]}
          >
            <RnText>Take document photo</RnText>
          </TouchableWithoutFeedback>
        </RnView>
      </RnView>
    </RnView>
  );
}
