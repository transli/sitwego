import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { themes } from "./theme_utils";
import { fontFamily } from "./tokens";

export const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: themes.bg_950,
    primary: themes.primary_500,
  },
  fonts: {
    ...DarkTheme.fonts,
    regular: {
      fontFamily: fontFamily.regular,
      fontWeight: "normal",
    },
    medium: {
      fontFamily: fontFamily.normal,
      fontWeight: "normal",
    },
    bold: {
      fontFamily: fontFamily.bold,
      fontWeight: "600",
    },
    heavy: {
      fontFamily: fontFamily.bold,
      fontWeight: "700",
    },
  },
};
export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: themes.bg_100,
    primary: themes.primary_500,
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: fontFamily.regular,
      fontWeight: "normal",
    },
    medium: {
      fontFamily: fontFamily.normal,
      fontWeight: "normal",
    },
    bold: {
      fontFamily: fontFamily.pro_regular,
      fontWeight: "600",
    },
    heavy: {
      fontFamily: fontFamily.bold,
      fontWeight: "700",
    },
  },
};

export type Colors = {
  primary: string;
  card: string;
  text: string;
  border: string;
};
export type ThemeMode = "light" | "dark";
export type ThemeType = typeof theme.light | typeof theme.dark;

export const theme = {
  dark: {
    themeMode: "dark",
    ...darkTheme,
    colors: {
      ...darkTheme.colors,
      text: "rgb(255, 255, 255)",
      transparent: themes.transparent,
      danger: themes.red_600,
      lightBackground: themes.bg_800,
      lightGray: themes.gray_200,
    },
  },
  light: {
    themeMode: "light",
    ...lightTheme,
    colors: {
      ...lightTheme.colors,
      text: "rgb(0, 0, 0)",
      transparent: themes.transparent,
      lightBackground: themes.bg_800,
      danger: themes.red_600,
      lightGray: themes.gray_900,
    },
  },
};
