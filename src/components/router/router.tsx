import { SystemBars } from "react-native-edge-to-edge";
import * as Location from "expo-location";
import { RouterNavigation } from "~/navigation/navigation";
import { TabsNavigator } from "./Bottom-Tabs/bottom-tabs";
import { useGetPushToken } from "~/hooks/useRequestPushNotifPermisions";
import { useEffect } from "react";

const BottomTabInner = () => {
  return (
    <>
      <TabsNavigator />
    </>
  );
};

export default function RootRouter() {
  const [status, requestPermission] = Location.useForegroundPermissions();
  // Background permissions are needed, as we does use background location updates.
  const [bgStatus, requestBgPermission] = Location.useBackgroundPermissions();
  useEffect(() => {
    if (bgStatus?.granted) return;
    (async function () {
      await requestBgPermission();
    })();
  }, [requestBgPermission, bgStatus?.granted]);
  useEffect(() => {
    if (status?.granted) return;
    (async function () {
      await requestPermission();
    })();
  }, [requestPermission, status?.granted]);
  useGetPushToken();
  return (
    <>
      <RouterNavigation>
        <SystemBars style={"light"} />
        <BottomTabInner />
      </RouterNavigation>
    </>
  );
}
