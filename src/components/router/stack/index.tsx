import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RideScreen } from "~/Screens/RideScreen";
import CollectCashAndConfirmRideEnded from "~/Screens/CollectCashAndConfirmRideEnded";
import { AccountMenuScreen } from "~/Screens/AccountMenuScreen";
import { CreateAccountScreen } from "~/Screens/Auth/CreateAccount";
import { nativeStackNavigationWithAuth } from "~/navigation/nativeStackNavigationWithAuth";
export const stack = nativeStackNavigationWithAuth();
export type Stack = typeof stack;
export function sharedStackScreens(Stack: Stack): React.JSX.Element {
  return (
    <>
      <Stack.Screen
        options={{ headerShown: true }}
        name="RideScreen"
        component={RideScreen}
      />
      <Stack.Screen
        options={{ headerShown: true, title: "Confirm Payment" }}
        name="CollectCashAndConfirmRideEnded"
        getComponent={() => CollectCashAndConfirmRideEnded}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="AccountMenuScreen"
        component={AccountMenuScreen}
      />

      {/* Onboarding Screen Group */}
      <Stack.Group
        screenOptions={{
          headerShown: false,
          sheetAllowedDetents: [1.0],
          presentation: "formSheet",
          sheetElevation: 24,
          animation: "slide_from_bottom",
          // unstable_sheetFooter: () => null,
        }}
      >
        <Stack.Screen
          options={{}}
          name="CreateAccountScreen"
          component={CreateAccountScreen}
        />
      </Stack.Group>
    </>
  );
}
