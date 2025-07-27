import React from "react";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { map_style } from "./RnMapStyles";
import { customStyle } from "./map_custom_style";
import { AnimatedMapView } from "react-native-maps/lib/MapView";

export type RnMapViewProps = React.ComponentProps<typeof MapView> & {
  children?: React.ReactNode;
};
const RnMapView = React.memo(
  React.forwardRef<MapView, RnMapViewProps>((props, ref) => {
    return (
      <AnimatedMapView
        provider={PROVIDER_GOOGLE}
        customMapStyle={customStyle}
        style={[map_style.map]}
        {...props}
        ref={ref}
      >
        {props.children}
      </AnimatedMapView>
    );
  }),
);
RnMapView.displayName = "RnMapView";
export default RnMapView;
