import React, { useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Controller, useForm } from "react-hook-form";
import RnText from "~/components/RnText";
import { RnView } from "~/components/RnView";
import { useAppTheme } from "~/ui/theme/ThemeProvider";
import { AuthScreenState } from "./AuthScreenType";
import { s } from "~/styles/Common-Styles";
import RnTextInput from "~/components/RnTextInput";
import { Pressable } from "react-native-gesture-handler";
import { useUserApi } from "~/lib/state/userState";

interface Props {
  setScreen: (prop?: AuthScreenState) => void;
  phone_number?: string;
}

type UserFormData = {
  name: string;
  password: string;
  email: string;
};
export const CreateAccountScreen: React.FC<Props> = ({
  setScreen,
  phone_number,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, fonts } = useAppTheme();
  const { control, handleSubmit, formState, getValues } =
    useForm<UserFormData>();
  const { createAccount } = useUserApi();

  const _goBack = useCallback(() => setScreen(undefined), [setScreen]);

  const _onContinue = useCallback(async () => {
    const values = getValues();
    if (!values.name || !values.email || !values.password) {
      throw new Error("All fields are required");
    }
    const { name, email, password } = values;
    const first_name = name.split(" ")[0];
    const last_name = name.split(" ")[1] || "";
    const mobile_country_code = "+254"; // Default to Kenya, can be made dynamic later

    await createAccount({
      contact_data: {
        email,
        phone_number: phone_number as string,
      },
      first_name,
      last_name,
      gender: "Male",
      password,
      mobile_country_code,
    });
  }, [createAccount, getValues, phone_number]);
  return (
    <RnView style={{ flex: 1, paddingTop: insets.top }}>
      <KeyboardAwareScrollView
        bottomOffset={40}
        disableScrollOnKeyboardHide
        contentContainerStyle={[s.px10, s.py16]}
      >
        <RnView style={[s.flexDirectionRow, s.gap16, { flexWrap: "wrap" }]}>
          <RnText>What is your name</RnText>
          <Controller
            name="name"
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
                placeholder="John Doe"
                placeholderTextColor={colors.lightGray}
                value={value}
              />
            )}
          />
        </RnView>
        <RnView style={{ marginVertical: 10 }} />
        <RnView style={[s.flexDirectionRow, s.gap16, { flexWrap: "wrap" }]}>
          <RnText>What is your email address</RnText>
          <Controller
            name="email"
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
                autoCapitalize="none"
                inputMode="email"
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="JohnDooe@example.com"
                placeholderTextColor={colors.lightGray}
                value={value}
              />
            )}
          />
        </RnView>
        <RnView style={{ marginVertical: 10 }} />
        <RnView style={[s.flexDirectionRow, s.gap16, { flexWrap: "wrap" }]}>
          <RnText>Enter a password to secure your account</RnText>
          <Controller
            name="password"
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
                autoCapitalize="none"
                secureTextEntry
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="**********"
                placeholderTextColor={colors.lightGray}
                value={value}
              />
            )}
          />
        </RnView>
        <RnView style={{ marginVertical: 10 }} />
        <Pressable
          onPress={_onContinue}
          style={[
            s.alignSelf,
            s.alignCenter,
            s.p16,
            {
              width: "80%",
              borderRadius: 8,
              backgroundColor: colors.primary,
            },
          ]}
        >
          <RnText style={[s.textCenter]}>Continue</RnText>
        </Pressable>
        <RnView style={{ marginVertical: 10 }} />
        <Pressable onPress={_goBack}>
          <RnText>Go Back</RnText>
        </Pressable>
      </KeyboardAwareScrollView>
    </RnView>
  );
};
CreateAccountScreen.displayName = "CreateAccountScreen";
