import { NativeModules, NativeEventEmitter } from "react-native";

export const { GeoKalmanModule } = NativeModules;
const nativeAppEvents = new NativeEventEmitter(GeoKalmanModule);

const {
  startGeokalmanService,
  stopGeokalmanService,
  getETA,
  isDriverOnline,
  saveTokenToSharedPreferences,
} = GeoKalmanModule;

const startBackgroundService = (token: string) => {
  startGeokalmanService(token);
};
export {
  nativeAppEvents,
  startBackgroundService,
  stopGeokalmanService,
  getETA,
  saveTokenToSharedPreferences,
  isDriverOnline,
};
