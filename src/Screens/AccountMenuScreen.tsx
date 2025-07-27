import React, { memo, useLayoutEffect } from "react";
import { RnView } from "~/components/RnView";
import RnText from "~/components/RnText";
import { useAppTheme } from "~/ui/theme/ThemeProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { s } from "~/styles/Common-Styles";
import { Pressable } from "react-native-gesture-handler";

const HEADER_HEIGHT = 60;
interface Props {}
const AccountMenuScreenHeader: React.FC<Props> = () => {
  const { colors } = useAppTheme();
  return (
    <RnView
      style={[
        s.flexDirectionRow,
        {
          height: HEADER_HEIGHT,
          justifyContent: "space-between",
          shadowColor: colors.background,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
      ]}
    >
      <RnText>Header here</RnText>
    </RnView>
  );
};
export const AccountMenuScreen: React.FC<any> = memo((props: any) => {
  const { colors } = useAppTheme();
  const inset = useSafeAreaInsets();
  return (
    <RnView style={[{ paddingTop: inset.top }, s.flex1]}>
      <AccountMenuScreenHeader />
      {/* <RnText>Account menu and settings screen</RnText> */}
      <Pressable
        style={{ marginTop: 20 }}
        onPress={() => props.navigation.push("CreateAccountScreen")}
      >
        <RnText style={{ color: colors.primary }}>Test Account Screen</RnText>
      </Pressable>
    </RnView>
  );
});

AccountMenuScreen.displayName = "AccountMenuScreen";
