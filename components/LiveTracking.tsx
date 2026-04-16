"use client";

import dynamic from "next/dynamic";
import { Request, Location } from "@/types";
import { useEffect, useState } from "react";
import { listenToDriverLocation } from "@/utils/listenRequests";

const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

interface LiveTrackingProps {
  request: Request;
  onComplete: () => void;
}

export default function LiveTracking({ request, onComplete }: LiveTrackingProps) {
  const [driverLocation, setDriverLocation] = useState<Location | undefined>(undefined);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!request.driverId) return;
    const unsub = listenToDriverLocation(request.driverId, (loc) => {
      if (loc) setDriverLocation(loc);
    });
    return () => unsub();
  }, [request.driverId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (request.acceptedAt) {
        setElapsed(Math.floor((Date.now() - request.acceptedAt) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [request.acceptedAt]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const isCompleted = request.status === "completed";

  return (
    <div className="flex flex-col h-full">
      {/* Map */}
      <div className="flex-1 rounded-2xl overflow-hidden mb-4" style={{ minHeight: "300px" }}>
        <MapComponent
          pickup={request.pickup}
          destination={request.destination}
          driverLocation={driverLocation}
          mode="tracking"
        />
      </div>

      {/* Info card */}
      <div className="rounded-2xl p-4" style={{
        background: "rgba(20,20,40,0.9)",
        border: "1px solid rgba(255,107,53,0.2)"
      }}>
        {isCompleted ? (
          <div className="text-center py-3">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="font-display text-2xl tracking-wider text-white mb-1">TAMAMLANDI</h3>
            <p className="text-sm mb-4" style={{ color: "#7070A0" }}>İyi yolculuklar!</p>
            <button
              onClick={onComplete}
              className="w-full py-3 rounded-xl font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #FF6B35, #e5521e)" }}
            >
              Ana Sayfaya Dön
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "#7070A0" }}>Çekici Yolda</p>
                <p className="font-semibold text-white">{request.driverPhone}</p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: "#7070A0" }}>Geçen süre</p>
                <p className="font-display text-2xl tracking-wider" style={{ color: "#FF6B35" }}>
                  {formatTime(elapsed)}
                </p>
              </div>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-2 p-2 rounded-lg mb-3" style={{ background: "rgba(76,175,80,0.08)" }}>
              <div className="w-2 h-2 rounded-full status-pulse flex-shrink-0" style={{ background: "#4CAF50" }} />
              <p className="text-xs" style={{ color: "#4CAF50" }}>
                {driverLocation ? "Canlı konum alınıyor" : "Konum bekleniyor..."}
              </p>
            </div>

            {/* Route mini info */}
            <div className="flex gap-2">
              <div className="flex-1 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-xs mb-0.5" style={{ color: "#7070A0" }}>Mesafe</p>
                <p className="text-sm font-semibold text-white">{request.distanceKm.toFixed(1)} km</p>
              </div>
              <div className="flex-1 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-xs mb-0.5" style={{ color: "#7070A0" }}>Ücret</p>
                <p className="text-sm font-semibold" style={{ color: "#FF6B35" }}>{request.price.toLocaleString("tr-TR")} ₺</p>
              </div>
              <div className="flex-1 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-xs mb-0.5" style={{ color: "#7070A0" }}>Durum</p>
                <p className="text-sm font-semibold" style={{ color: "#4CAF50" }}>
                  {request.status === "on_way" ? "Yolda" : "Kabul edildi"}
                </p>
              </div>
            </div>

            {request.driverPhone && (
              <a
                href={`tel:${request.driverPhone}`}
                className="flex items-center justify-center gap-2 w-full mt-3 py-3 rounded-xl font-medium text-white text-sm"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C9.6 21 3 14.4 3 6c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" stroke="white" strokeWidth="2"/>
                </svg>
                Sürücüyü Ara
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}
