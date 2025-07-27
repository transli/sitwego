import { createContext, useContext } from "react";
export type ControlsContextType = {
  next: () => void;
  previous: () => void;
  finish: () => void;
  hasPrev: boolean;
  totalSteps: number;
  activeStep: "vehicle_details" | "docs" | "finish"; //| "services" | "driver_docs";
  activeStepIndex: number;
  vehicleDetails?: {
    vehicleType: string;
    make: string;
    model: string;
    year: string;
    vin?: string;
    licensePlate: string;
    color: string;
  };
  docs?: {
    idType: string;
    idNo: string;
    idImageFrontAndBack: string;
    driverLicense: string;
    dlExpiry: string;
    certificateOfGoodConductFromDCI: string;
    certificateOfGoodConductExpiry: string;
    psvBadge: string;
    psvBadgeExpiry: string;
    inspection?: string;
    inspectionExpiry?: string;
    psvInsurance?: string;
    psvInsuranceExpiry?: string;
  };
};
export type OnboardingActions =
  | {
      type: "next";
    }
  | {
      type: "previous";
    }
  | {
      type: "finish";
    }
  | {
      type: "setVehicleDetails";
      vehicleDetails: ControlsContextType["vehicleDetails"];
      apiResponse: any;
    }
  | {
      type: "setDocs";
      docs: ControlsContextType["docs"];
      apiResponse: any;
    };

export const initialState: ControlsContextType = {
  next: () => {},
  previous: () => {},
  finish: () => {},
  hasPrev: false,
  totalSteps: 3,
  activeStep: "vehicle_details",
  activeStepIndex: 0,
  vehicleDetails: undefined,
  docs: undefined,
};

export const OnboardingControlsContext = createContext<{
  state: ControlsContextType;
  dispatch: React.Dispatch<OnboardingActions>;
}>({
  state: { ...initialState },
  dispatch: () => {},
});

export const reducer = (
  state: ControlsContextType,
  act: OnboardingActions,
): ControlsContextType => {
  let next = { ...state };

  switch (act.type) {
    case "next": {
      if (state.activeStep === "vehicle_details") {
        next.activeStep = "docs";
        next.activeStepIndex = 1;
      } else if (state.activeStep === "docs") {
        next.activeStep = "finish";
        next.activeStepIndex = 3;
      }
      break;
    }
    case "previous": {
      if (state.activeStep === "docs") {
        next.activeStep = "vehicle_details";
        next.activeStepIndex = 1;
      } else if (state.activeStep === "finish") {
        next.activeStep = "docs";
        next.activeStepIndex = 2;
      }
      break;
    }
    case "finish": {
      break;
    }
    case "setDocs": {
      break;
    }
    case "setVehicleDetails": {
      next = initialState;
      break;
    }
  }

  return {
    ...next,
    hasPrev: next.activeStep !== "vehicle_details",
  };
};
export function useOnboardingControls() {
  const context = useContext(OnboardingControlsContext);
  if (!context) {
    throw new Error(
      "useOnboardingControls must be used within an OnboardingControlsProvider",
    );
  }
  return context;
}
export const OnboardingControlsProvider = OnboardingControlsContext.Provider;
