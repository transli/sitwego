import React, { useEffect } from "react";
import { nativeAppEvents } from "../native";
import { RideRequsetNotification } from "~/types/rideRequstTypes";
import { formatedRideData, parseRideRequestData } from "~/utils/rideUtils";
import { rideStore } from "../store";

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "SET_RIDE":
      return { ...state, ride: action.payload };
    case "REMOVE_RIDE":
      return { ...state, ride: null };
    default:
      return state;
  }
};
const _initialRideStatus: RideStatus = {
  hasRideStarted: false,
  hasRideCanceled: false,
  hasDriverArrived: false,
};

export const initialRideStatus = { rideStatus: _initialRideStatus };

function rideStatusReducer(state: RideState, action: RideAction): RideState {
  switch (action.type) {
    case "UPDATE_RIDE_STATUS":
      const rideState = {
        ...state,
        rideStatus: {
          ...state?.rideStatus,
          ...action.payload,
        },
      };
      rideStore.set(["rideStatus"], rideState);
      return rideState;
    default:
      return state;
  }
}

export const RideRequestStatusContext = React.createContext<{
  setRideStatus: React.Dispatch<RideAction>;
  rideStatus: RideState;
}>({
  setRideStatus: () => {
    throw new Error("Function not implemented.");
  },
  rideStatus: initialRideStatus,
});

export const useRideRequestStatus = () => {
  const context = React.useContext(RideRequestStatusContext);
  if (!context) {
    throw new Error(
      "useRideRequestStatus must be used within a UseRideRequestProvider",
    );
  }
  return context;
};

type RideRequestApiContextProps = {
  setRide: (p: any) => void;
  removeRide: () => void;
  rideState?: any;
};
const RideRequestApiContext = React.createContext<RideRequestApiContextProps>({
  setRide: () => {},
  removeRide: () => {},
});
export const useRideRequest = () => {
  const context = React.useContext(RideRequestApiContext);
  if (!context) {
    throw new Error(
      "useRideRequest must be used within a UseRideRequestProvider",
    );
  }
  return context;
};

export const UseRideRequestProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const data = rideStore.get(["ride"]);
  const initRideStatus = rideStore.get([
    "rideStatus",
  ]) as typeof initialRideStatus;
  const [rideState, setRideState] = React.useReducer(reducer, data);
  const [rideStatus, setRideStatus] = React.useReducer(
    rideStatusReducer,
    initRideStatus,
  );
  useEffect(() => {
    const sub = nativeAppEvents.addListener(
      "onRideReqMessage",
      (ride_request: RideRequsetNotification) => {
        const ride_data = parseRideRequestData(ride_request);
        if (!ride_data.data) return;
        let notificationData = formatedRideData(ride_data.data);
        setRideState({
          type: "SET_RIDE",
          payload: {
            ...ride_data,
            data: notificationData,
          },
        });
      },
    );
    return () => sub.remove();
  }, []);

  const setRide = React.useCallback(
    (ride: any) => {
      setRideState({ type: "SET_RIDE", payload: ride });
    },
    [setRideState],
  );
  const removeRide = React.useCallback(() => {
    setRideState({ type: "REMOVE_RIDE" });
  }, [setRideState]);

  const rideStatusApi = React.useMemo(
    () => ({
      rideStatus,
      setRideStatus,
    }),
    [setRideStatus, rideStatus],
  );

  const ride_api = React.useMemo(
    () => ({
      rideState,
      setRide,
      removeRide,
    }),
    [rideState, setRide, removeRide],
  );
  return (
    <RideRequestApiContext.Provider value={ride_api}>
      <RideRequestStatusContext.Provider value={rideStatusApi}>
        {children}
      </RideRequestStatusContext.Provider>
    </RideRequestApiContext.Provider>
  );
};

interface RideStatus {
  hasRideStarted: boolean;
  hasRideCanceled: boolean;
  hasDriverArrived: boolean;
}

interface RideState {
  rideStatus: RideStatus;
}

type RideAction = {
  type: string;
  payload?: Partial<RideStatus>;
};
