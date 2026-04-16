"use client";

import { VehicleType, VEHICLE_LABELS, Location } from "@/types";

interface PriceCardProps {
  pickup: Location;
  destination: Location;
  vehicleType: VehicleType;
  price: number;
  distanceKm: number;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
}

export default function PriceCard({
  pickup,
  destination,
  vehicleType,
  price,
  distanceKm,
  onConfirm,
  onBack,
  loading,
}: PriceCardProps) {
  const kmRate = { sedan: 22, suv: 27, kamyonet: 32 }[vehicleType];

  return (
    <div className="animate-slide-up">
      <div className="rounded-2xl overflow-hidden mb-4" style={{
        background: "rgba(20,20,40,0.9)",
        border: "1px solid rgba(255,107,53,0.2)"
      }}>
        {/* Price header */}
        <div className="p-5" style={{ background: "linear-gradient(135deg, rgba(255,107,53,0.15), rgba(255,107,53,0.05))" }}>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#7070A0" }}>Tahmini Ücret</p>
          <div className="flex items-end gap-2">
            <span className="font-display text-5xl tracking-wider" style={{ color: "#FF6B35" }}>
              {price.toLocaleString("tr-TR")}
            </span>
            <span className="text-xl text-white font-light mb-1">₺</span>
          </div>
          <p className="text-xs mt-1" style={{ color: "#7070A0" }}>
            {VEHICLE_LABELS[vehicleType]} • {distanceKm.toFixed(1)} km
          </p>
        </div>

        {/* Breakdown */}
        <div className="p-5 space-y-3">
          <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span className="text-sm" style={{ color: "#7070A0" }}>Baz ücret</span>
            <span className="text-sm text-white font-medium">1.500 ₺</span>
          </div>
          <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span className="text-sm" style={{ color: "#7070A0" }}>Mesafe ücreti</span>
            <span className="text-sm text-white font-medium">
              {distanceKm.toFixed(1)} km × {kmRate} ₺ = {(distanceKm * kmRate).toFixed(0)} ₺
            </span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-sm font-semibold text-white">Toplam</span>
            <span className="font-semibold" style={{ color: "#FF6B35" }}>{price.toLocaleString("tr-TR")} ₺</span>
          </div>
        </div>

        {/* Route summary */}
        <div className="px-5 pb-5 space-y-2">
          <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#FF6B35" }} />
            <div>
              <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "#7070A0" }}>Alış Noktası</p>
              <p className="text-sm text-white leading-tight">{pickup.address || `${pickup.lat.toFixed(4)}, ${pickup.lng.toFixed(4)}`}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#4CAF50" }} />
            <div>
              <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "#7070A0" }}>Hedef</p>
              <p className="text-sm text-white leading-tight">{destination.address || `${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}`}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-xl font-medium text-sm"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#9090B0"
          }}
        >
          ← Geri
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-[2] py-4 rounded-xl font-semibold text-white text-base relative overflow-hidden"
          style={{
            background: loading ? "rgba(255,107,53,0.4)" : "linear-gradient(135deg, #FF6B35, #e5521e)",
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Aranıyor...
            </span>
          ) : "Çekici Çağır 🚛"}
        </button>
      </div>
    </div>
  );
}
