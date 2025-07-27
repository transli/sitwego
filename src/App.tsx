import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GestureDetectorProvider } from "react-native-screens/gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import RootRouter from "./components/router/router";
import { ThemeProvider } from "./ui/theme/ThemeProvider";
import { Provider as DefaultPortal } from "./lib/Providers/Portal";

import { SafeAreaProvider } from "react-native-safe-area-context";
import { UseRideRequestProvider } from "./lib/Providers/UseRideRequestProvider";
import { NetworkQueryProvider } from "./lib/net";
import { useEffect } from "react";
import { saveTokenToSharedPreferences } from "./lib/native";
import { useRequestPushNotifPermisions } from "./hooks/useRequestPushNotifPermisions";
import { LoggedOutProvider } from "./lib/Providers/LoggedoutProvider";
import { UserStateProvider, useUserState } from "./lib/state/userState";

const InnerApp = () => {
  const state = useUserState();
  useEffect(() => {
    (async function (token) {
      if (token) {
        await saveTokenToSharedPreferences(token);
      }
    })(state.token || "");
  }, [state.token]);
  return (
    <GestureHandlerRootView style={[styles.container]}>
      <GestureDetectorProvider>
        <RootRouter />
      </GestureDetectorProvider>
    </GestureHandlerRootView>
  );
};

export default function App() {
  const requestPushNotification = useRequestPushNotifPermisions();
  useEffect(() => {
    (async function () {
      await requestPushNotification();
    })();
  }, [requestPushNotification]);
  return (
    <SafeAreaProvider>
      <ThemeProvider themeMode={"dark"}>
        <KeyboardProvider>
          <DefaultPortal>
            <NetworkQueryProvider>
              <UserStateProvider>
                <UseRideRequestProvider>
                  <LoggedOutProvider>
                    <InnerApp />
                  </LoggedOutProvider>
                </UseRideRequestProvider>
              </UserStateProvider>
            </NetworkQueryProvider>
          </DefaultPortal>
        </KeyboardProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
