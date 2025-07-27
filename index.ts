import { registerRootComponent } from "expo";
import { Platform } from "react-native";
import BackgroundTimer from "react-native-background-timer";
import App from "~/App";

declare const global: any;

function setUpGloabals() {
  // Let timers run while Android app is in the background.
  if (Platform.OS === "android") {
    global.clearTimeout = BackgroundTimer.clearTimeout.bind(BackgroundTimer);
    global.clearInterval = BackgroundTimer.clearInterval.bind(BackgroundTimer);
    global.setInterval = BackgroundTimer.setInterval.bind(BackgroundTimer);
    global.setTimeout = (fn: () => void, ms = 0) =>
      BackgroundTimer.setTimeout(fn, ms);
  }
}
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
setUpGloabals();
registerRootComponent(App);
