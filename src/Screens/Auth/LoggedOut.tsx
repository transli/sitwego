import React, { useCallback, useEffect, useState } from "react";
import { BackHandler, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RnText from "~/components/RnText";
import { RnView } from "~/components/RnView";
import { s } from "~/styles/Common-Styles";
import { atoms } from "~/ui/theme/atoms";
import { useAppTheme } from "~/ui/theme/ThemeProvider";
import { CreateAccountScreen } from "./CreateAccount";
import { AuthScreenState } from "./AuthScreenType";
import { LogInScreen } from "./Loggin";
import { ForgotPasswordScreen } from "./ForgotPassword";
import { PhoneModal } from "./PhoneModal";

interface Props {
  onDismiss?: () => void;
  showLoggedOut?: boolean;
}
export const LoggedOut: React.FC<Props> = ({ onDismiss }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [authScreenState, setAuthScreenState] = useState<AuthScreenState>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>();

  const _setAuthScreenState = useCallback((screen?: AuthScreenState) => {
    setAuthScreenState(screen);
    setPhoneNumber(undefined);
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isOpen) {
        setIsOpen(false);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [isOpen]);

  const _closePhoneModal = useCallback(() => {
    setIsOpen(false);
    return;
  }, []);

  const createAccount = useCallback(() => {
    setAuthScreenState(AuthScreenState.Auth_S_CreateAccountScreen);
    setIsOpen(true);
  }, []);
  if (
    authScreenState === AuthScreenState.Auth_S_CreateAccountScreen &&
    phoneNumber
  ) {
    return (
      <CreateAccountScreen
        phone_number={phoneNumber}
        setScreen={_setAuthScreenState}
      />
    );
  }
  // if (authScreenState === AuthScreenState.Auth_S_LoginScreen) {
  //   return <LogInScreen setScreen={_setAuthScreenState} />;
  // }
  // if (authScreenState === AuthScreenState.Auth_S_ForgotPasswordScreen) {
  //   return <ForgotPasswordScreen setScreen={_setAuthScreenState} />;
  // }

  return (
    <>
      <RnView
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 10,
        }}
      >
        <RnView style={[s.flex1, s.justifyFlexEnd]}>
          <RnView
            style={[
              s.flexDirectionRow,
              atoms.gap_lg,
              s.alignCenter,
              s.justifyCenter,
              { flexWrap: "wrap" },
            ]}
          >
            <Pressable
              onPress={createAccount}
              style={[
                s.p16,
                s.alignCenter,
                s.justifyCenter,
                {
                  backgroundColor: colors.primary,
                  width: "90%",
                  borderRadius: 8,
                },
              ]}
            >
              <RnText style={[{ color: colors.text }]}>Create Account</RnText>
            </Pressable>
            <Pressable
              onPress={() =>
                _setAuthScreenState(AuthScreenState.Auth_S_LoginScreen)
              }
              style={[
                s.p16,
                s.alignCenter,
                s.justifyCenter,
                {
                  backgroundColor: colors.lightBackground,
                  width: "90%",
                  borderRadius: 8,
                },
              ]}
            >
              <RnText style={[{ color: colors.text }]}>Log In</RnText>
            </Pressable>
          </RnView>
        </RnView>
      </RnView>

      <PhoneModal
        isOpen={isOpen}
        setPhoneNumber={setPhoneNumber}
        close={_closePhoneModal}
      />
    </>
  );
};
