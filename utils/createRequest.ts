import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Request, VehicleType, Location } from "@/types";

export async function createRequest(
  userId: string,
  userPhone: string,
  pickup: Location,
  destination: Location,
  vehicleType: VehicleType,
  price: number,
  distanceKm: number
): Promise<string> {
  const requestData = {
    userId,
    userPhone,
    pickup,
    destination,
    vehicleType,
    price,
    distanceKm,
    status: "searching",
    createdAt: Date.now(),
  };

  const docRef = await addDoc(collection(db, "requests"), requestData);
  return docRef.id;
}
