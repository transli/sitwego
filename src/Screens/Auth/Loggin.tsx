import React, { useCallback, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RnText from "~/components/RnText";
import { RnView } from "~/components/RnView";
import { useAppTheme } from "~/ui/theme/ThemeProvider";
import { AuthScreenState } from "./AuthScreenType";
import { Pressable } from "react-native-gesture-handler";

interface Props {
  setScreen: (prop: AuthScreenState) => void;
}
export const LogInScreen: React.FC<Props> = ({ setScreen }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  return (
    <RnView style={{ flex: 1, paddingTop: insets.top }}>
      <Pressable
        style={[]}
        onPress={() => setScreen(AuthScreenState.Auth_S_ForgotPasswordScreen)}
      >
        <RnText>Forgot Password?</RnText>
      </Pressable>
    </RnView>
  );
};
LogInScreen.displayName = "LogInScreen";
