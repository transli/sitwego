// Based on @react-navigation/native-stack/src/navigators/createNativeStackNavigator.ts
// MIT License
// Copyright (c) 2017 React Navigation Contributors

import * as React from "react";
import { View } from "react-native";
import {
  createNavigatorFactory,
  type EventArg,
  type NavigatorTypeBagBase,
  type ParamListBase,
  type StackActionHelpers,
  StackActions,
  type StackNavigationState,
  StackRouter,
  type StackRouterOptions,
  type StaticConfig,
  type TypedNavigator,
  useNavigationBuilder,
} from "@react-navigation/native";
import { NativeStackView } from "@react-navigation/native-stack";
import {
  type NativeStackNavigationEventMap,
  type NativeStackNavigationOptions,
  type NativeStackNavigationProp,
  type NativeStackNavigatorProps,
} from "@react-navigation/native-stack";
import { s } from "~/styles/Common-Styles";
import { LoggedOut } from "~/Screens/Auth/LoggedOut";
import { useUserState } from "~/lib/state/userState";
import { DriverOnboarding } from "~/ui/onboarding";

type NativeStackNavigationOptionsWithAuth = NativeStackNavigationOptions & {
  requireAuth?: boolean;
};

function NativeStackNavigator({
  id,
  initialRouteName,
  children,
  layout,
  screenListeners,
  screenOptions,
  screenLayout,
  ...rest
}: NativeStackNavigatorProps) {
  // --- this is copy and pasted from the original native stack navigator ---
  const { state, describe, descriptors, navigation, NavigationContent } =
    useNavigationBuilder<
      StackNavigationState<ParamListBase>,
      StackRouterOptions,
      StackActionHelpers<ParamListBase>,
      NativeStackNavigationOptionsWithAuth,
      NativeStackNavigationEventMap
    >(StackRouter, {
      id,
      initialRouteName,
      children,
      layout,
      screenListeners,
      screenOptions,
      screenLayout,
    });

  const userState = useUserState();
  React.useEffect(
    () =>
      // @ts-expect-error: there may not be a tab navigator in parent
      navigation?.addListener?.("tabPress", (e: any) => {
        const isFocused = navigation.isFocused();

        // Run the operation in the next frame so we're sure all listeners have been run
        // This is necessary to know if preventDefault() has been called
        requestAnimationFrame(() => {
          if (
            state.index > 0 &&
            isFocused &&
            !(e as EventArg<"tabPress", true>).defaultPrevented
          ) {
            // When user taps on already focused tab and we're inside the tab,
            // reset the stack to replicate native behaviour
            navigation.dispatch({
              ...StackActions.popToTop(),
              target: state.key,
            });
          }
        });
      }),
    [navigation, state.index, state.key],
  );

  // --- start custom logic here ---
  const hasSession = React.useMemo(
    () => userState.isLoggedIn && userState.token,
    [userState.isLoggedIn, userState.token],
  );
  const activate_account = React.useMemo(
    () => userState.activated,
    [userState.activated],
  );
  const activeRoute = state.routes[state.index];
  const activeDescriptor = descriptors[activeRoute.key];
  // const activeRouteRequiresAuth = activeDescriptor.options.requireAuth ?? false;

  // if (hasSession && currentAccount?.status === "takendown") {
  //   return <Blocked />;
  // }
  if (!hasSession) {
    return <LoggedOut />;
  }
  if (!activate_account) {
    return <DriverOnboarding />;
  }
  const newDescriptors: typeof descriptors = {};
  for (let key in descriptors) {
    const descriptor = descriptors[key];
    newDescriptors[key] = {
      ...descriptor,
      render() {
        return descriptor.render();
      },
    };
  }

  return (
    <NavigationContent>
      <View role="main" style={[s.flex1]}>
        <NativeStackView
          {...rest}
          state={state}
          navigation={navigation}
          descriptors={descriptors}
          describe={describe}
        />
      </View>
    </NavigationContent>
  );
}

export function nativeStackNavigationWithAuth<
  const ParamList extends ParamListBase,
  const NavigatorID extends string | undefined = undefined,
  const TypeBag extends NavigatorTypeBagBase = {
    ParamList: ParamList;
    NavigatorID: NavigatorID;
    State: StackNavigationState<ParamList>;
    ScreenOptions: NativeStackNavigationOptionsWithAuth;
    EventMap: NativeStackNavigationEventMap;
    NavigationList: {
      [RouteName in keyof ParamList]: NativeStackNavigationProp<
        ParamList,
        RouteName,
        NavigatorID
      >;
    };
    Navigator: typeof NativeStackNavigator;
  },
  const Config extends StaticConfig<TypeBag> = StaticConfig<TypeBag>,
>(config?: Config): TypedNavigator<TypeBag, Config> {
  return createNavigatorFactory(NativeStackNavigator)(config);
}
