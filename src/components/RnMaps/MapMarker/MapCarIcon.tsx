import { Image } from "expo-image";
import React, { memo, useEffect, useMemo, useRef } from "react";
import { Animated } from "react-native";
import { MarkerAnimated } from "react-native-maps";
import { getMarkerRotation, GpsData } from "~/utils/geo";

interface Props {
  geo_point: GpsData[];
}
const MapCarIcon: React.FC<Props> = ({ geo_point }) => {
  const currentPosition = geo_point[0].geo_point;

  const rotationAngle = useRef(new Animated.Value(0)).current;

  // Find the closest segment on the polyline for smoother rotation
  const targetRotationAngle = useMemo(() => {
    if (geo_point.length < 2) return 0; // Default angle if not enough points
    const firstPosition = geo_point[0];
    let closestIndex = 0; // Start with first segment
    let minDistance = Infinity;

    for (let i = 0; i < geo_point.length - 1; i++) {
      const distance = Math.hypot(
        geo_point[i].geo_point.latitude - firstPosition.geo_point.latitude,
        geo_point[i].geo_point.longitude - firstPosition.geo_point.longitude,
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    // Ensure index is within bounds
    if (closestIndex < 0 || closestIndex >= geo_point.length - 1) return 0;

    return getMarkerRotation(
      geo_point[closestIndex].geo_point,
      geo_point[closestIndex + 1].geo_point,
    );
  }, [geo_point]);

  useEffect(() => {
    Animated.timing(rotationAngle, {
      toValue: targetRotationAngle,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [rotationAngle, targetRotationAngle]);
  return (
    <MarkerAnimated
      anchor={{ x: 0.5, y: 0.5 }}
      coordinate={currentPosition}
      rotation={rotationAngle} // Rotate the marker
    >
      <Image
        source={require("../../../../assets/images/ic_taxi.png")} // Always set the marker to the last position
        style={{
          height: 45,
          width: 45,
        }}
        contentFit="contain"
      />
    </MarkerAnimated>
  );
};
export default memo(MapCarIcon);
