import { GeoPoint } from "~/utils/geo";

type Location = {
  area_code: string | null;
  building: string | null;
  city: string | null;
  country: string | null;
  door: string | null;
  extras: string | null;
  floor: string | null;
  geo_point: GeoPoint;
  instructions: string | null;
  place_id: string | null;
  road: string | null;
  street: string | null;
  ward: string | null;
};

type RideData = {
  distance: number;
  distance_to_pickup: number;
  duration_to_pickup: number;
  estimated_start_time: unknown;
  fare: number;
  id: string;
  msg: string;
  search_request_id: string;
  search_request_valid_till: unknown;
  to: Location;
  from: Location;
  ride_line_str: GeoPoint[] | null;
  driver_to_pickup_line_str: GeoPoint[] | null;
  [key: string]: any;
};
type RideRequsetData = {
  from: Omit<Location, "geo_point"> & {
    geo_point: { lat: number; lon: number };
  };
  to: Omit<Location, "geo_point"> & {
    geo_point: { lat: number; lon: number };
  };
  distance: number;
  distance_to_pickup: number;
  duration_to_pickup: number;
  estimated_start_time: unknown;
  fare: number;
  id: string;
  msg: string;
  search_request_id: string;
  search_request_valid_till: unknown;
  ride_line_str: [number, number][] | null;
  driver_to_pickup_line_str: [number, number][] | null;
};

type RideRequsetNotification = {
  data: string; // JSON stringified RideRequsetData
  type: string;
  category: string;
  id: string;
  ttl: string;
};

type RideNotificationType = {
  data: RideData;
  type: string;
  category: string;
  id: string;
  ttl?: string;
  opened?: boolean;
  [key: string]: any;
};
export {
  RideData,
  Location,
  RideRequsetNotification,
  RideRequsetData,
  RideNotificationType,
};
