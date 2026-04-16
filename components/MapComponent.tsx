"use client";

import { useEffect, useRef, useCallback } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Location } from "@/types";

interface MapComponentProps {
  pickup?: Location;
  destination?: Location;
  driverLocation?: Location;
  onPickupSelect?: (location: Location) => void;
  onDestinationSelect?: (location: Location) => void;
  mode: "user-select" | "tracking";
  selectingFor?: "pickup" | "destination";
}

let mapInstance: google.maps.Map | null = null;
let pickupMarker: google.maps.Marker | null = null;
let destinationMarker: google.maps.Marker | null = null;
let driverMarker: google.maps.Marker | null = null;
let directionsRenderer: google.maps.DirectionsRenderer | null = null;
let geocoder: google.maps.Geocoder | null = null;

export default function MapComponent({
  pickup,
  destination,
  driverLocation,
  onPickupSelect,
  onDestinationSelect,
  mode,
  selectingFor,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  const initMap = useCallback(async () => {
    if (!mapRef.current || isInitialized.current) return;
    isInitialized.current = true;

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      version: "weekly",
      libraries: ["places", "geometry"],
    });

    await loader.load();
    geocoder = new google.maps.Geocoder();

    const bursa = { lat: 40.1885, lng: 29.0610 };

    mapInstance = new google.maps.Map(mapRef.current, {
      center: bursa,
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#8888bb" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a4a" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a1a3a" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3a3a5a" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#0D1B2A" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ],
    });

    directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: { strokeColor: "#FF6B35", strokeWeight: 4, strokeOpacity: 0.8 },
    });
    directionsRenderer.setMap(mapInstance);

    if (mode === "user-select") {
      mapInstance.addListener("click", async (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        try {
          const res = await geocoder!.geocode({ location: { lat, lng } });
          if (res.results[0]) address = res.results[0].formatted_address;
        } catch (_) {}

        const loc: Location = { lat, lng, address };
        if (selectingFor === "pickup") onPickupSelect?.(loc);
        else if (selectingFor === "destination") onDestinationSelect?.(loc);
      });
    }
  }, [mode, selectingFor, onPickupSelect, onDestinationSelect]);

  useEffect(() => { initMap(); }, [initMap]);

  useEffect(() => {
    if (!mapInstance) return;
    if (pickup) {
      if (pickupMarker) pickupMarker.setMap(null);
      pickupMarker = new google.maps.Marker({
        position: pickup,
        map: mapInstance,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#FF6B35",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
        title: "Alış noktası",
      });
      mapInstance.panTo(pickup);
    }
  }, [pickup]);

  useEffect(() => {
    if (!mapInstance) return;
    if (destination) {
      if (destinationMarker) destinationMarker.setMap(null);
      destinationMarker = new google.maps.Marker({
        position: destination,
        map: mapInstance,
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: "#4CAF50",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
        title: "Hedef",
      });
    }
    if (pickup && destination && directionsRenderer) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: pickup,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK" && result) {
            directionsRenderer!.setDirections(result);
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(pickup);
            bounds.extend(destination);
            mapInstance!.fitBounds(bounds, 60);
          }
        }
      );
    }
  }, [destination, pickup]);

  useEffect(() => {
    if (!mapInstance || !driverLocation) return;
    if (driverMarker) {
      driverMarker.setPosition(driverLocation);
    } else {
      driverMarker = new google.maps.Marker({
        position: driverLocation,
        map: mapInstance,
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="#FF6B35" stroke="white" stroke-width="2"/>
              <text x="20" y="26" text-anchor="middle" font-size="18">🚛</text>
            </svg>
          `),
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20),
        },
        title: "Çekici konumu",
      });
    }
    mapInstance.panTo(driverLocation);
  }, [driverLocation]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-2xl overflow-hidden"
      style={{ minHeight: "280px" }}
    />
  );
}
