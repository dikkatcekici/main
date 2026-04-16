"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { VehicleType, Location, Request, VEHICLE_LABELS } from "@/types";
import { calculatePrice, getDistanceMatrix } from "@/utils/calculatePrice";
import { createRequest } from "@/utils/createRequest";
import { listenToRequest } from "@/utils/listenRequests";
import { getCurrentPosition } from "@/utils/trackLocation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PriceCard from "./PriceCard";
import RequestStatus from "./RequestStatus";
import LiveTracking from "./LiveTracking";

const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

type Step = "map" | "price" | "searching" | "tracking";
type SelectMode = "pickup" | "destination" | null;

interface UserPanelProps {
  uid: string;
  phone: string;
  onLogout: () => void;
}

export default function UserPanel({ uid, phone, onLogout }: UserPanelProps) {
  const [step, setStep] = useState<Step>("map");
  const [vehicleType, setVehicleType] = useState<VehicleType>("sedan");
  const [pickup, setPickup] = useState<Location | undefined>(undefined);
  const [destination, setDestination] = useState<Location | undefined>(undefined);
  const [selectMode, setSelectMode] = useState<SelectMode>("pickup");
  const [price, setPrice] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [request, setRequest] = useState<Request | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!requestId) return;
    const unsub = listenToRequest(requestId, (r) => {
      if (r) setRequest(r);
    });
    return () => unsub();
  }, [requestId]);

  useEffect(() => {
    if (request?.status === "accepted" || request?.status === "on_way") {
      setStep("tracking");
    }
  }, [request?.status]);

  const handleGetLocation = async () => {
    setLocating(true);
    setError("");
    try {
      const loc = await getCurrentPosition();
      setPickup({ ...loc, address: "Mevcut konumunuz" });
      setSelectMode("destination");
    } catch (e) {
      setError("Konum alınamadı. Lütfen haritadan seçin.");
    } finally {
      setLocating(false);
    }
  };

  const handleCalculate = async () => {
    if (!pickup || !destination) {
      setError("Lütfen alış ve hedef konumunu seçin");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { distanceKm: dist } = await getDistanceMatrix(
        { lat: pickup.lat, lng: pickup.lng },
        { lat: destination.lat, lng: destination.lng }
      );
      const p = calculatePrice(dist, vehicleType);
      setDistanceKm(dist);
      setPrice(p);
      setStep("price");
    } catch (e: any) {
      setError("Mesafe hesaplanamadı: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!pickup || !destination) return;
    setLoading(true);
    try {
      const id = await createRequest(uid, phone, pickup, destination, vehicleType, price, distanceKm);
      setRequestId(id);
      setStep("searching");
    } catch (e) {
      setError("İstek oluşturulamadı");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!requestId) return;
    await updateDoc(doc(db, "requests", requestId), { status: "cancelled" });
    setStep("map");
    setRequestId(null);
    setRequest(null);
    setPickup(undefined);
    setDestination(undefined);
    setSelectMode("pickup");
  };

  const vehicles: { type: VehicleType; label: string; icon: string; rate: number }[] = [
    { type: "sedan", label: "Binek", icon: "🚗", rate: 22 },
    { type: "suv", label: "SUV", icon: "🚙", rate: 27 },
    { type: "kamyonet", label: "Kamyonet", icon: "🛻", rate: 32 },
  ];

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "#0D0D1A" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <h1 className="font-display text-2xl tracking-wider" style={{ color: "#FF6B35" }}>ÇEKİCİ</h1>
          <p className="text-xs" style={{ color: "#7070A0" }}>{phone}</p>
        </div>
        <button onClick={onLogout} className="text-xs px-3 py-1.5 rounded-lg"
          style={{ background: "rgba(255,255,255,0.05)", color: "#7070A0" }}>
          Çıkış
        </button>
      </div>

      {/* Map */}
      {(step === "map" || step === "tracking") && (
        <div className="mx-4 rounded-2xl overflow-hidden" style={{ height: "42vh" }}>
          {step === "map" ? (
            <MapComponent
              pickup={pickup}
              destination={destination}
              mode="user-select"
              selectingFor={selectMode || undefined}
              onPickupSelect={(loc) => {
                setPickup(loc);
                setSelectMode("destination");
              }}
              onDestinationSelect={(loc) => {
                setDestination(loc);
                setSelectMode(null);
              }}
            />
          ) : request ? (
            <LiveTracking request={request} onComplete={() => {
              setStep("map");
              setRequestId(null);
              setRequest(null);
              setPickup(undefined);
              setDestination(undefined);
              setSelectMode("pickup");
            }} />
          ) : null}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {step === "map" && (
          <div className="space-y-4 animate-fade-in">
            {/* Map instruction */}
            {selectMode && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{ background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.2)" }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#FF6B35" }} />
                <p className="text-sm" style={{ color: "#FF6B35" }}>
                  {selectMode === "pickup" ? "Haritaya dokunarak alış noktası seçin" : "Haritaya dokunarak hedef seçin"}
                </p>
              </div>
            )}

            {/* Vehicle selection */}
            <div>
              <p className="text-xs uppercase tracking-wider mb-2 px-1" style={{ color: "#7070A0" }}>Araç Tipi</p>
              <div className="grid grid-cols-3 gap-2">
                {vehicles.map((v) => (
                  <button
                    key={v.type}
                    onClick={() => setVehicleType(v.type)}
                    className="p-3 rounded-xl text-center transition-all"
                    style={{
                      background: vehicleType === v.type ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${vehicleType === v.type ? "rgba(255,107,53,0.5)" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <div className="text-2xl mb-1">{v.icon}</div>
                    <div className="text-xs font-medium text-white">{v.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#7070A0" }}>{v.rate} ₺/km</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Location inputs */}
            <div className="space-y-2">
              <button
                onClick={handleGetLocation}
                disabled={locating}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left"
                style={{
                  background: pickup ? "rgba(255,107,53,0.08)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${pickup ? "rgba(255,107,53,0.3)" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,107,53,0.15)" }}>
                  {locating ? (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,107,53,0.3)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="3" fill="#FF6B35"/>
                      <path d="M12 2v3m0 14v3M2 12h3m14 0h3" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs" style={{ color: "#7070A0" }}>Alış Noktası</p>
                  <p className="text-sm truncate" style={{ color: pickup ? "white" : "#5A5A80" }}>
                    {pickup ? (pickup.address || `${pickup.lat.toFixed(4)}, ${pickup.lng.toFixed(4)}`) : "Konumumu kullan / haritadan seç"}
                  </p>
                </div>
                {pickup && (
                  <button onClick={(e) => { e.stopPropagation(); setPickup(undefined); setSelectMode("pickup"); }}
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.1)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </button>

              <button
                onClick={() => setSelectMode("destination")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left"
                style={{
                  background: destination ? "rgba(76,175,80,0.08)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${destination ? "rgba(76,175,80,0.3)" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(76,175,80,0.15)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#4CAF50"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs" style={{ color: "#7070A0" }}>Hedef Konum</p>
                  <p className="text-sm truncate" style={{ color: destination ? "white" : "#5A5A80" }}>
                    {destination ? (destination.address || `${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}`) : "Haritadan seçin"}
                  </p>
                </div>
                {destination && (
                  <button onClick={(e) => { e.stopPropagation(); setDestination(undefined); setSelectMode("destination"); }}
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.1)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </button>
            </div>

            {error && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(233,69,96,0.1)", color: "#E94560" }}>
                {error}
              </p>
            )}

            <button
              onClick={handleCalculate}
              disabled={!pickup || !destination || loading}
              className="w-full py-4 rounded-xl font-semibold text-white text-base"
              style={{
                background: (!pickup || !destination || loading) ? "rgba(255,107,53,0.25)" : "linear-gradient(135deg, #FF6B35, #e5521e)",
                transition: "all 0.2s"
              }}
            >
              {loading ? "Hesaplanıyor..." : "Fiyat Hesapla →"}
            </button>
          </div>
        )}

        {step === "price" && pickup && destination && (
          <PriceCard
            pickup={pickup}
            destination={destination}
            vehicleType={vehicleType}
            price={price}
            distanceKm={distanceKm}
            onConfirm={handleCreateRequest}
            onBack={() => setStep("map")}
            loading={loading}
          />
        )}

        {step === "searching" && request && (
          <RequestStatus request={request} onCancel={handleCancel} />
        )}
      </div>
    </div>
  );
}
