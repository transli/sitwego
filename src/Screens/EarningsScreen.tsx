import React, { use } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RnText from "~/components/RnText";
import { RnView } from "~/components/RnView";
import { themes } from "~/ui/theme/theme_utils";
import { useAppTheme } from "~/ui/theme/ThemeProvider";

const styles = StyleSheet.create({
  screenContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
});

export const EarningsScreen: React.FC<any> = ({ navigation }) => {
  const inset = useSafeAreaInsets();
  const { colors } = useAppTheme();
  return (
    <RnView style={[styles.screenContainer, { paddingTop: inset.top }]}>
      <RnView style={[{ marginBottom: inset.bottom + 20, flex: 1 }]}></RnView>
    </RnView>
  );
};
