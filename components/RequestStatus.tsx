"use client";

import { Request, VEHICLE_LABELS } from "@/types";

interface RequestStatusProps {
  request: Request;
  onCancel: () => void;
}

export default function RequestStatus({ request, onCancel }: RequestStatusProps) {
  const isSearching = request.status === "searching";
  const isAccepted = request.status === "accepted" || request.status === "on_way";

  return (
    <div className="animate-slide-up space-y-4">
      {/* Status card */}
      <div className="rounded-2xl p-5" style={{
        background: "rgba(20,20,40,0.9)",
        border: `1px solid ${isAccepted ? "rgba(76,175,80,0.3)" : "rgba(255,107,53,0.2)"}`
      }}>
        {isSearching ? (
          <div className="text-center py-4">
            {/* Animated truck */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full flex items-center justify-center car-animate"
                  style={{ background: "rgba(255,107,53,0.1)", border: "2px solid rgba(255,107,53,0.3)" }}>
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12h18M3 12L6 9m-3 3l3 3" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round"/>
                    <rect x="1" y="10" width="14" height="8" rx="2" stroke="#FF6B35" strokeWidth="2"/>
                    <circle cx="6" cy="19" r="2" fill="#FF6B35"/>
                    <circle cx="14" cy="19" r="2" fill="#FF6B35"/>
                    <path d="M15 14h5l2-4h-7" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                {/* Ripple rings */}
                <div className="absolute inset-0 rounded-full status-pulse" style={{ border: "2px solid rgba(255,107,53,0.4)" }} />
                <div className="absolute -inset-3 rounded-full" style={{
                  border: "1px solid rgba(255,107,53,0.2)",
                  animation: "statusPulse 2s 0.5s infinite"
                }} />
              </div>
            </div>

            <h3 className="font-display text-2xl tracking-wider text-white mb-2">ÇEKICI ARANYOR</h3>
            <p className="text-sm mb-4" style={{ color: "#7070A0" }}>
              En yakın çekiciye bağlanılıyor...
            </p>

            {/* Loading dots */}
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full dot-1" style={{ background: "#FF6B35" }} />
              <div className="w-2 h-2 rounded-full dot-2" style={{ background: "#FF6B35" }} />
              <div className="w-2 h-2 rounded-full dot-3" style={{ background: "#FF6B35" }} />
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(76,175,80,0.15)", border: "2px solid rgba(76,175,80,0.4)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-display text-2xl tracking-wider text-white mb-1">ÇEKICI BULUNDU!</h3>
            <p className="text-sm" style={{ color: "#4CAF50" }}>Çekici yola çıktı, takip edebilirsiniz</p>

            {request.driverPhone && (
              <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(76,175,80,0.08)", border: "1px solid rgba(76,175,80,0.2)" }}>
                <p className="text-xs mb-1" style={{ color: "#7070A0" }}>Sürücü telefonu</p>
                <a href={`tel:${request.driverPhone}`} className="font-semibold text-white text-lg">
                  {request.driverPhone}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Request details */}
        <div className="mt-4 pt-4 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex justify-between">
            <span className="text-xs" style={{ color: "#7070A0" }}>Araç tipi</span>
            <span className="text-xs font-medium text-white">{VEHICLE_LABELS[request.vehicleType]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs" style={{ color: "#7070A0" }}>Mesafe</span>
            <span className="text-xs font-medium text-white">{request.distanceKm.toFixed(1)} km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs" style={{ color: "#7070A0" }}>Ücret</span>
            <span className="text-xs font-semibold" style={{ color: "#FF6B35" }}>{request.price.toLocaleString("tr-TR")} ₺</span>
          </div>
        </div>
      </div>

      {isSearching && (
        <button
          onClick={onCancel}
          className="w-full py-3 rounded-xl text-sm font-medium"
          style={{
            background: "rgba(233,69,96,0.1)",
            border: "1px solid rgba(233,69,96,0.3)",
            color: "#E94560"
          }}
        >
          İptal Et
        </button>
      )}
    </div>
  );
}
