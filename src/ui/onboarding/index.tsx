import { Portal } from "~/lib/Providers/Portal";
import { OnboardingControls, OnboardingLayout } from "./OnBoardingControls";
import { OnboardingControlsContext, reducer, initialState } from "./state";
import React, { useMemo } from "react";
import { VehicleDetails } from "./vehicleDetails";
import { Docs } from "./docs";

export function DriverOnboarding() {
  const [state, dispatch] = React.useReducer(reducer, {
    ...initialState,
  });
  const stateCtx = useMemo(() => ({ state, dispatch }), [state]);
  return (
    <OnboardingControls.Provider>
      <OnboardingControlsContext.Provider value={stateCtx}>
        <OnboardingLayout>
          {state.activeStep === "vehicle_details" && <VehicleDetails />}
          {state.activeStep === "docs" && <Docs />}
        </OnboardingLayout>
      </OnboardingControlsContext.Provider>
    </OnboardingControls.Provider>
  );
}
