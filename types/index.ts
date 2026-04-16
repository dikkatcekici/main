export type VehicleType = "sedan" | "suv" | "kamyonet";

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Request {
  id?: string;
  userId: string;
  userPhone: string;
  pickup: Location;
  destination: Location;
  vehicleType: VehicleType;
  price: number;
  distanceKm: number;
  status: "searching" | "accepted" | "on_way" | "arrived" | "completed" | "cancelled";
  driverId?: string;
  driverPhone?: string;
  createdAt: number;
  acceptedAt?: number;
}

export interface Driver {
  id: string;
  phone: string;
  name: string;
  vehicleTypes: VehicleType[];
  isOnline: boolean;
  location?: Location;
  currentRequestId?: string;
  createdAt: number;
}

export interface User {
  id: string;
  phone: string;
  type: "user" | "driver";
  createdAt: number;
}

export interface PriceConfig {
  base: number;
  sedan: number;
  suv: number;
  kamyonet: number;
}

export const PRICE_CONFIG: PriceConfig = {
  base: 1500,
  sedan: 22,
  suv: 27,
  kamyonet: 32,
};

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  sedan: "Binek",
  suv: "SUV",
  kamyonet: "Kamyonet",
};
