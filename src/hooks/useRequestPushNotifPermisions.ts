import * as ExpoNotifications from "expo-notifications";
import { useEffect } from "react";
export function useRequestPushNotifPermisions() {
  return async () => {
    const perms = await ExpoNotifications.getPermissionsAsync();
    if (
      perms?.status === "granted" ||
      (perms?.status === "denied" && !perms?.canAskAgain)
    ) {
      console.log("PERMISSIONS GRANTED!!");
      return;
    }

    const reqPermsResponse = await ExpoNotifications.requestPermissionsAsync();
    if (reqPermsResponse.granted) {
      console.log("NOTIFICATIONS PERMISSION GRANTED");
      const pushToken = await getPushToken(reqPermsResponse.granted);
      console.log(pushToken);
    }
  };
}

export function useGetPushToken() {
  useEffect(() => {
    (async function () {
      const pushToken = await getPushToken();
      console.log(pushToken);
    })();
    const subscription = ExpoNotifications.addPushTokenListener(
      async (newToken) => {
        console.log(newToken);
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);
}

async function getPushToken(skipPermissionCheck = false) {
  const granted =
    skipPermissionCheck ||
    (await ExpoNotifications.getPermissionsAsync()).granted;
  if (granted) {
    return ExpoNotifications.getDevicePushTokenAsync();
  }
}
