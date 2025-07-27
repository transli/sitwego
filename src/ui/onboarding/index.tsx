import { OnboardingControls, OnboardingLayout } from "./OnBoardingControls";
import { OnboardingControlsContext, reducer, initialState } from "./state";
import React, { useEffect, useMemo } from "react";
import { VehicleDetails } from "./vehicleDetails";
import { Docs } from "./docs";
import { SubmitData } from "./Submit";
import { BackHandler } from "react-native";

export function DriverOnboarding() {
  const [state, dispatch] = React.useReducer(reducer, null, () => ({
    ...initialState,
  }));
  const stateCtx = useMemo(() => ({ state, dispatch }), [state]);
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (state.hasPrev) {
        dispatch({ type: "previous" });
        return true;
      } else {
        return false;
      }
    });
    return () => sub.remove();
  }, [state]);
  return (
    <OnboardingControls.Provider>
      <OnboardingControlsContext.Provider value={stateCtx}>
        <OnboardingLayout>
          {state.activeStep === "vehicle_details" && <VehicleDetails />}
          {state.activeStep === "docs" && <Docs />}
          {state.activeStep === "finish" && <SubmitData />}
        </OnboardingLayout>
      </OnboardingControlsContext.Provider>
    </OnboardingControls.Provider>
  );
}
