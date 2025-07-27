import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { makeApiCall } from "~/lib/net/axios";
import {
  useRideRequest,
  useRideRequestStatus,
  initialRideStatus,
} from "~/lib/Providers/UseRideRequestProvider";
import { rideStore } from "~/lib/store";
import { RideNotificationType } from "~/types/rideRequstTypes";
import { GeoPoint } from "~/utils/geo";

export function useAcceptRideRequestMutation() {
  return useMutation({
    async mutationFn({
      ride_id,
      from,
      to,
    }: {
      ride_id: string;
      from: GeoPoint;
      to: GeoPoint;
    }) {
      return await makeApiCall({
        url: `accept-ride-request/${ride_id}/accept`,
        data: {
          from: {
            geo_point: {
              lat: from.latitude,
              lon: from.longitude,
            },
          },
          to: {
            geo_point: {
              lat: to.latitude,
              lon: from.longitude,
            },
          },
        },
        method: "POST",
      });
    },
    async onSuccess(data: any) {
      console.log(data);
    },
    onError(error, variables, context) {
      console.log(error);
    },
    retry: 3,
  });
}
export function useCreateRideRequestMutation() {
  const { rideState } = useRideRequest();
  const ride = useMemo(() => {
    return (rideState as { ride: RideNotificationType })?.ride;
  }, [rideState]);
  return useMutation({
    async mutationFn({ start_otp }: { start_otp: string }) {
      return await makeApiCall({
        url: "create-ride",
        method: "POST",
        data: {
          start_otp: start_otp,
          a: {
            lat: ride.data.from.geo_point.latitude,
            lon: ride.data.from.geo_point.longitude,
          },
          b: {
            lat: ride.data.to.geo_point.latitude,
            lon: ride.data.to.geo_point.longitude,
          },
        },
      });
    },
    onError(error, variables, context) {
      console.log(error);
    },
    async onSuccess(data, variables, context) {
      console.log(data);
    },
    retry: 3,
  });
}
export function useEndrideRequestMutation() {
  const { rideState, removeRide } = useRideRequest();
  const { setRideStatus } = useRideRequestStatus();
  const ride = useMemo(() => {
    return (rideState as { ride: RideNotificationType })?.ride;
  }, [rideState]);
  return useMutation({
    async mutationFn({ last_location }: { last_location: GeoPoint }) {
      return await makeApiCall({
        url: `end-ride/${ride.id}/end`,
        method: "DELETE",
        data: {
          ride_path_id: ride?.data.search_request_id,
          geo_point: {
            lat: last_location.latitude,
            lon: last_location.longitude,
          },
        },
      });
    },
    async onSuccess(data, variables, context) {
      console.log(data);
      removeRide();
      setRideStatus({
        type: "UPDATE_RIDE_STATUS",
        payload: {
          ...initialRideStatus.rideStatus,
        },
      });
      rideStore.removeMany([], ["ride", "rideStatus"]);
    },
    onError(error, variables, context) {},
    retry: 3,
  });
}
