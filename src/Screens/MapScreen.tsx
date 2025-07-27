import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import RnMapView from "~/components/RnMaps/RnMapView";
import { useAppTheme } from "~/ui/theme/ThemeProvider";
import MapView, { Camera, Marker } from "react-native-maps";
import HomeMenuBar from "~/ui/Views/HomeMenuBar";
import { RnMapPolyline } from "~/components/RnMaps/MapPolyline/Polyline";
import { themes } from "~/ui/theme/theme_utils";
import { GpsData, OnGpsData } from "~/utils/geo";
import MapCarIcon from "~/components/RnMaps/MapMarker/MapCarIcon";
import { useFocusEffect } from "@react-navigation/native";
import { nativeAppEvents } from "~/lib/native";
import { useRideRequest } from "~/lib/Providers/UseRideRequestProvider";
import { RideNotificationType } from "~/types/rideRequstTypes";
import { delay } from "~/utils/await_timer";
import { DeviceEventEmitter, NativeSyntheticEvent } from "react-native";
import { Image } from "expo-image";

const TARGET_SCREEN_PERCENTAGE = 0.951;
const LATITUDE_DELTA = 0.0955; // Adjust for desired zoom level (city-level zoom)

export const MapScreen = (props: any) => {
  const { colors } = useAppTheme();
  const mapRef = useRef<MapView>(null);
  const [zoom, setZoom] = useState<number>(14.9);
  const [currentDriverLoaction, setCurrentDriverLocation] = useState<GpsData>();
  const [onMapReady, setOnMapReady] = useState<boolean>(false);
  const [camera, _setCamera] = useState<Camera>(() => {
    return {
      zoom,
      center: {
        latitude: -1.2676625388519933,
        longitude: 36.60956291005589,
      },
      heading: -10,
      pitch: 5,
    };
  });

  const { rideState } = useRideRequest();

  const ride = useMemo(() => {
    return (rideState as { ride: RideNotificationType })?.ride;
  }, [rideState]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("onRideComplete", () => {
      console.log("CAN SHOW RATING MODAL?.");
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (ride?.data && ride.data.ride_line_str) {
      const latitudeOffset = calculateLatOffset(
        ride?.data?.ride_line_str[0].latitude,
      );
      mapRef.current?.animateCamera(
        {
          center: {
            latitude: latitudeOffset,
            longitude: ride?.data?.ride_line_str[0].longitude,
          },
          heading: -15,
          zoom: 16,
        },
        { duration: 1000 },
      );
    }
  }, [ride, onMapReady]);

  useFocusEffect(React.useCallback(() => {}, []));

  const _onMapLoaded = useCallback(() => {
    console.log("Map Loaded");
    setOnMapReady(true);
  }, []);

  const _onMapReady = useCallback(() => {
    console.log("Map Ready");
  }, []);

  const getLocationStatusOnPath = useCallback(
    (
      {
        geo_point: { latitude, longitude },
        accuracy,
        pitch,
        heading,
        bearing,
      }: GpsData,
      altitude: number,
    ) => {
      setCurrentDriverLocation({
        geo_point: { latitude, longitude },
        accuracy,
        pitch,
        bearing,
      });
      // mapRef.current?.animateCamera(
      //   {
      //     center: {
      //       latitude,
      //       longitude,
      //     },
      //     // heading: bearing ? bearing : 0,
      //     altitude,
      //   },
      //   { duration: 1000 },
      // );
    },
    [],
  );

  useEffect(() => {
    let sub = nativeAppEvents.addListener(
      "onGeoKalman",
      async (data: OnGpsData) => {
        const {
          latitude,
          longitude,
          accuracy,
          bearing,
          isMoving,
          altitude,
          speed,
          distance,
        } = data;
        getLocationStatusOnPath(
          {
            geo_point: {
              latitude,
              longitude,
            },
            accuracy,
            bearing,
          },
          altitude,
        );
      },
    );

    return () => sub.remove();
  }, [getLocationStatusOnPath]);

  const _onProfilePress = useCallback(() => {
    props.navigation.push("AccountMenuScreen", {
      driver_id: "12345",
    });
  }, [props.navigation]);

  const polyline = useMemo(() => {
    return (
      <RnMapPolyline
        key="ride_line"
        geodesic={true}
        strokeColor={themes.primary_500}
        fillColor={themes.primary_500}
        coordinates={ride?.data?.ride_line_str || []}
        lineCap="round"
        lineJoin="round"
        strokeWidth={6}
      />
    );
  }, [ride?.data?.ride_line_str]);
  const driver_to_pickup = useMemo(() => {
    return (
      <RnMapPolyline
        key="driver_to_pickup"
        geodesic={true}
        strokeColor={themes.green_500}
        fillColor={themes.green_500}
        coordinates={ride?.data?.driver_to_pickup_line_str || []}
        lineCap="round"
        lineJoin="round"
        strokeWidth={6}
      />
    );
  }, [ride?.data?.driver_to_pickup_line_str]);
  const map_car_icon = useMemo(() => {
    if (!currentDriverLoaction) {
      return null;
    }
    return <MapCarIcon geo_point={[currentDriverLoaction as GpsData]} />;
  }, [currentDriverLoaction]);

  const ic_marker_user = useMemo(() => {
    if (!ride?.data) return null;
    return (
      <Marker
        anchor={{ x: 0.5, y: 0.5 }}
        coordinate={{ ...ride?.data?.from.geo_point }}
      >
        <Image
          style={{
            height: 32,
            width: 28,
          }}
          source={require("../../assets/images/ic_marker_user.png")} // Always set the marker to the last position
          contentFit="contain"
        />
      </Marker>
    );
  }, [ride?.data]);
  return (
    <React.Fragment>
      <HomeMenuBar navigation={props.navigation} onPress={_onProfilePress} />
      <RnMapView
        camera={camera}
        onMapReady={_onMapReady}
        onMapLoaded={_onMapLoaded}
        ref={mapRef}
        zoomEnabled
        showsUserLocation={true}
        showsCompass={false}
        pitchEnabled
        userLocationPriority="high"
        showsMyLocationButton={false}
        toolbarEnabled={false}
        onRegionChangeComplete={() => {
          // console.log("onRegionChangeComplete");
        }}
      >
        {polyline}
        {driver_to_pickup}
        {map_car_icon}
        {ic_marker_user}
      </RnMapView>
    </React.Fragment>
  );
};

const calculateLatOffset = (latitude: number) => {
  // Offset the center latitude to position the region at the top
  // Subtract the offset to move the center upward
  const latitudeOffset = (LATITUDE_DELTA * (1 - TARGET_SCREEN_PERCENTAGE)) / 2;
  return latitude - latitudeOffset;
};
