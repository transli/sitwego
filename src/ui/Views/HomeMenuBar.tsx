import React, { memo, useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
import RnText from "~/components/RnText";
import { RnAnimatedView, RnView } from "~/components/RnView";
import { useAppTheme } from "../theme/ThemeProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "~/components/Avatar";
import { atoms } from "../theme/atoms";
import Icon from "~/components/Icons";

interface Props {
  navigation?: any;
  onPress?: () => void;
}
const DUMMY_IMAGE =
  "https://images.unsplash.com/photo-1748499426766-a4fa3b24b10f?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const HomeMenuBar: React.FC<Props> = ({ onPress }) => {
  const { colors, fonts } = useAppTheme();
  const { top } = useSafeAreaInsets();
  const onLoad = useCallback(() => {}, []);
  return (
    <RnAnimatedView
      style={[
        HMB_styles.HMB_container_view,
        { backgroundColor: colors.lightBackground, top: top + 10 },
      ]}
    >
      <RnView
        style={[
          atoms.flex_1,
          atoms.gap_sm,
          { flexDirection: "row", alignItems: "center" },
        ]}
      >
        <Pressable style={{ padding: 0 }} onPress={onPress}>
          <Avatar size={50} styles={{}} avatar={DUMMY_IMAGE} onLoad={onLoad} />
        </Pressable>
        <RnView style={[atoms.gap_xs]}>
          <RnText style={[atoms.text_2xs, { color: colors.lightGray }]}>
            Julius Mburu
          </RnText>
          <RnText
            style={[atoms.text_sm, { fontFamily: fonts.bold.fontFamily }]}
          >
            125,000 Ksh
          </RnText>
        </RnView>
      </RnView>
      <RnView
        style={[
          atoms.gap_xs,
          atoms.gap_sm,
          {
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          },
        ]}
      >
        <Icon
          name="Star"
          size={20}
          strokeWidth={2.5}
          color={colors.lightGray}
        />
        <RnText
          style={[
            atoms.text_sm,
            { fontFamily: fonts.heavy.fontFamily, textAlign: "center" },
          ]}
        >
          4.5
        </RnText>
      </RnView>
    </RnAnimatedView>
  );
};

export default memo(HomeMenuBar);

const HMB_styles = StyleSheet.create({
  HMB_container_view: {
    position: "absolute",
    flexDirection: "row",
    zIndex: 999,
    width: "95%",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderRadius: 16,
    height: 60,
    paddingHorizontal: 8,
  },
});
