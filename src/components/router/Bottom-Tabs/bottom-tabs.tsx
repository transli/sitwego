import * as React from "react";
import { useLinkBuilder } from "@react-navigation/native";
import { View } from "react-native";
import { PlatformPressable } from "@react-navigation/elements";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GoOnlineSlider from "./BottomView/bottom-view";

import Icon from "~/components/Icons";
import { themes } from "~/ui/theme/theme_utils";
import { useAppTheme } from "~/ui/theme/ThemeProvider";
import { MapScreen } from "~/Screens/MapScreen";
import { sharedStackScreens } from "../stack";
import { EarningsScreen } from "~/Screens/EarningsScreen";
import { startBackgroundService, stopGeokalmanService } from "~/lib/native";
import { useRideRequest } from "~/lib/Providers/UseRideRequestProvider";
import { useIsdriverOnline } from "~/hooks/useIsdriverOnline";
import { nativeStackNavigationWithAuth } from "~/navigation/nativeStackNavigationWithAuth";
import { useUserState } from "~/lib/state/userState";

function GoOnlineScreen() {
  return null;
}

function TabBar({ state, descriptors, navigation }: any) {
  const { colors } = useAppTheme();
  const { buildHref } = useLinkBuilder();
  const isDriverOnline = useIsdriverOnline();
  const insets = useSafeAreaInsets();
  const prevStateRef = React.useRef<boolean | null>(null);
  const [isOnduty, setOnduty] = React.useState<boolean>(false);
  const userState = useUserState();
  const { rideState } = useRideRequest();

  React.useEffect(() => {
    (async function () {
      const _isOnduty = await isDriverOnline();
      console.log("DRIVER IS ON DUTY:", _isOnduty);
      setOnduty(_isOnduty);
    })();
  }, [isDriverOnline]);

  const hasSession = React.useMemo(
    () => userState.isLoggedIn && userState.token && userState.activated,
    [userState.activated, userState.isLoggedIn, userState.token],
  );
  const cb = React.useCallback(
    (state: boolean) => {
      if (prevStateRef.current !== state) {
        if (state && hasSession) {
          // start background service
          startBackgroundService(userState.profile_id);
          setOnduty(state);
        } else {
          // stop background service
          stopGeokalmanService();
          setOnduty(state);
        }
        prevStateRef.current = state;
      }
    },
    [hasSession, userState.profile_id],
  );
  React.useEffect(() => {
    if (rideState?.ride && !isOnduty) {
      console.log("STARTING GRPC AFTER APP BEING CLOSS", isOnduty);
      cb(true);
      return;
    }
  }, [cb, isOnduty, rideState?.ride]);

  if (!hasSession) {
    return null;
  }

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: themes.bg_800, // "rgb(30, 61, 73)",
        justifyContent: "space-between",
        alignSelf: "center",
        alignItems: "center",
        borderRadius: 20,
        width: "87%",
        height: 50,
        position: "absolute",
        bottom: insets.bottom + 5, // Adjusted to account for bottom inset
        paddingHorizontal: 20,
      }}
    >
      {state.routes.map(
        (
          route: {
            key: string | number;
            name: string;
            params: object | undefined;
          },
          index: React.Key | null | undefined,
        ) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          if (index === 1) {
            return (
              <View key={index} style={{}}>
                <GoOnlineSlider isOnline={isOnduty} onStateChange={cb} />
              </View>
            );
          }
          return (
            <PlatformPressable
              key={index}
              href={buildHref(route.name, route.params)}
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{}}
            >
              <Icon
                name={label}
                size={28}
                color={isFocused ? colors.primary : colors.text}
                strokeWidth={2}
              />
            </PlatformPressable>
          );
        },
      )}
    </View>
  );
}

const Tab = createBottomTabNavigator();
const HomeStack = nativeStackNavigationWithAuth();
const GoOnlineTabStack = nativeStackNavigationWithAuth();
const EarningsStack = nativeStackNavigationWithAuth();

function HomeTabSreens() {
  const { colors } = useAppTheme();
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        headerStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <HomeStack.Screen
        name="MapScreen"
        component={MapScreen}
        options={{ headerShown: false }}
      />
      {sharedStackScreens(HomeStack)}
    </HomeStack.Navigator>
  );
}

function GoOnlineTab() {
  const { colors } = useAppTheme();
  return (
    <GoOnlineTabStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        headerStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <GoOnlineTabStack.Screen
        name="__Screen"
        component={GoOnlineScreen}
        options={{ headerShown: false }}
      />
      {sharedStackScreens(GoOnlineTabStack)}
    </GoOnlineTabStack.Navigator>
  );
}
function EarningsTab() {
  const { colors } = useAppTheme();
  return (
    <EarningsStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        headerStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <EarningsStack.Screen
        name="HandCoinsScreen"
        component={EarningsScreen}
        options={{ headerShown: false }}
      />
      {sharedStackScreens(EarningsStack)}
    </EarningsStack.Navigator>
  );
}

export const TabsNavigator = () => {
  return (
    <>
      <Tab.Navigator
        tabBar={(props) => <TabBar {...props} />}
        initialRouteName="Map"
        backBehavior="history"
        screenOptions={{
          tabBarStyle: [
            {
              height: 300,
              borderTopWidth: 1,
              elevation: 5,
            },
          ],
          tabBarShowLabel: false,
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Map"
          component={HomeTabSreens}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // Prevent default action
              e.preventDefault();

              // Do something manually
              navigation.navigate("Map");
            },
          })}
        />
        <Tab.Screen name="__" component={GoOnlineTab} />
        <Tab.Screen name="HandCoins" component={EarningsTab} />
      </Tab.Navigator>
    </>
  );
};
