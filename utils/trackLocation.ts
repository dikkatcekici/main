import { doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

let watchId: number | null = null;

export function trackLocation(
  driverId: string,
  onUpdate?: (lat: number, lng: number) => void
): void {
  if (!navigator.geolocation) return;

  watchId = navigator.geolocation.watchPosition(
    async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      try {
        await updateDoc(doc(db, "drivers", driverId), {
          location: { lat, lng },
          locationUpdatedAt: Date.now(),
        });
        onUpdate?.(lat, lng);
      } catch (e) {
        console.error("Konum güncellenemedi:", e);
      }
    },
    (err) => console.error("Geolocation hatası:", err),
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
  );
}

export function stopTracking(): void {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}

export async function setDriverOnlineStatus(
  driverId: string,
  isOnline: boolean,
  phone: string
): Promise<void> {
  await setDoc(
    doc(db, "drivers", driverId),
    {
      id: driverId,
      phone,
      isOnline,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}

export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      reject,
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
