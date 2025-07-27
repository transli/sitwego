import { Image, ImageStyle } from "expo-image";
import React, { memo, useMemo } from "react";
import { type ViewStyle } from "react-native";
import { RnView } from "./RnView";
import { HDRnImage } from "~/lib/Image/HDRnImage";

type Props = {
  size: number;
  styles?: ViewStyle;
  onLoad: () => void;
  avatar: string;
};
const Avatar: React.FC<Props> = memo(({ size, styles, avatar, onLoad }) => {
  const img_style: ImageStyle = useMemo(() => {
    return {
      width: size,
      height: size,
      borderRadius: Math.floor(size / 2),
    };
  }, [size]);
  const avatar_container = useMemo(
    () => ({
      height: size,
      width: size,
      ...styles,
    }),
    [size, styles],
  );
  return (
    <RnView style={[avatar_container]}>
      <HDRnImage
        accessibilityIgnoresInvertColors
        style={[img_style]}
        source={{
          uri: avatar,
        }}
        onLoad={onLoad}
        contentFit="cover"
        testID="avatarImageTest"
      />
    </RnView>
  );
});

Avatar.displayName = "Avatar";
export default Avatar;
