import { VehicleType, PRICE_CONFIG } from "@/types";

export function calculatePrice(distanceKm: number, vehicleType: VehicleType): number {
  const kmRate = PRICE_CONFIG[vehicleType];
  const total = PRICE_CONFIG.base + distanceKm * kmRate;
  return Math.round(total);
}

export async function getDistanceMatrix(
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral
): Promise<{ distanceKm: number; durationText: string }> {
  return new Promise((resolve, reject) => {
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status !== "OK" || !response) {
          reject(new Error("Distance Matrix hatası: " + status));
          return;
        }
        const element = response.rows[0].elements[0];
        if (element.status !== "OK") {
          reject(new Error("Rota bulunamadı"));
          return;
        }
        const distanceKm = element.distance.value / 1000;
        const durationText = element.duration.text;
        resolve({ distanceKm, durationText });
      }
    );
  });
}
