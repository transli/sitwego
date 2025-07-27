import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type NavigationProps<T extends keyof RootStackNavigationType> =
  NativeStackScreenProps<RootStackNavigationType, T, undefined>;
export type RootStackNavigationType = {
  RideScreen: undefined;
};
