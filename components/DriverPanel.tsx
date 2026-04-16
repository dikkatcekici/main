"use client";

import { useState, useEffect, useCallback } from "react";
import { Request, VEHICLE_LABELS } from "@/types";
import { listenToSearchingRequests } from "@/utils/listenRequests";
import { acceptRequest, updateRequestStatus } from "@/utils/acceptRequest";
import { trackLocation, stopTracking, setDriverOnlineStatus } from "@/utils/trackLocation";

interface DriverPanelProps {
  uid: string;
  phone: string;
  onLogout: () => void;
}

export default function DriverPanel({ uid, phone, onLogout }: DriverPanelProps) {
  const [isOnline, setIsOnline] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [activeRequest, setActiveRequest] = useState<Request | null>(null);
  const [popup, setPopup] = useState<Request | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [earnings, setEarnings] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleOnline = useCallback(async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    await setDriverOnlineStatus(uid, newStatus, phone);
    if (newStatus) {
      trackLocation(uid, (lat, lng) => setDriverLocation({ lat, lng }));
    } else {
      stopTracking();
    }
  }, [isOnline, uid, phone]);

  useEffect(() => {
    if (!isOnline) return;
    const unsub = listenToSearchingRequests((reqs) => {
      setRequests(reqs);
      const newReqs = reqs.filter(r =>
        !activeRequest &&
        !popup &&
        r.createdAt > Date.now() - 60000
      );
      if (newReqs.length > 0 && !popup) {
        setPopup(newReqs[0]);
      }
    });
    return () => unsub();
  }, [isOnline, activeRequest, popup]);

  useEffect(() => {
    return () => { stopTracking(); };
  }, []);

  const handleAccept = async (request: Request) => {
    if (!request.id) return;
    setLoading(request.id);
    const success = await acceptRequest(request.id, uid, phone);
    setLoading(null);
    if (success) {
      setActiveRequest(request);
      setPopup(null);
      showNotification("İş kabul edildi! 🎉");
    } else {
      showNotification("Bu iş zaten alındı");
      setPopup(null);
    }
  };

  const handleStatusUpdate = async (status: "on_way" | "arrived" | "completed") => {
    if (!activeRequest?.id) return;
    await updateRequestStatus(activeRequest.id, status);
    if (status === "completed") {
      setEarnings(e => e + activeRequest.price);
      setCompletedCount(c => c + 1);
      setActiveRequest(null);
      showNotification("İş tamamlandı! 💰");
    } else {
      setActiveRequest({ ...activeRequest, status });
    }
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    accepted: { label: "Kabul Edildi", color: "#FF6B35" },
    on_way: { label: "Yolda", color: "#2196F3" },
    arrived: { label: "Varıldı", color: "#9C27B0" },
  };

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "#0D0D1A" }}>
      {/* Notification toast */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-xl animate-slide-up"
          style={{ background: "rgba(30,30,60,0.98)", border: "1px solid rgba(255,107,53,0.4)", minWidth: "200px", textAlign: "center" }}>
          <p className="text-sm text-white font-medium">{notification}</p>
        </div>
      )}

      {/* New job popup */}
      {popup && !activeRequest && (
        <div className="fixed inset-0 z-40 flex items-end justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-sm rounded-2xl p-5 animate-slide-up"
            style={{ background: "#141428", border: "2px solid rgba(255,107,53,0.5)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full status-pulse" style={{ background: "#FF6B35" }} />
              <span className="text-sm font-semibold" style={{ color: "#FF6B35" }}>YENİ İŞ GELDİ!</span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: "#7070A0" }}>Araç</span>
                <span className="text-sm font-medium text-white">{VEHICLE_LABELS[popup.vehicleType]} {popup.vehicleType === "sedan" ? "🚗" : popup.vehicleType === "suv" ? "🚙" : "🛻"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: "#7070A0" }}>Mesafe</span>
                <span className="text-sm font-medium text-white">{popup.distanceKm.toFixed(1)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: "#7070A0" }}>Kazanç</span>
                <span className="text-lg font-bold" style={{ color: "#FF6B35" }}>{popup.price.toLocaleString("tr-TR")} ₺</span>
              </div>
            </div>

            <div className="p-3 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="flex items-start gap-2 mb-2">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#FF6B35" }} />
                <p className="text-xs text-white leading-tight">{popup.pickup.address || `${popup.pickup.lat.toFixed(3)}, ${popup.pickup.lng.toFixed(3)}`}</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#4CAF50" }} />
                <p className="text-xs text-white leading-tight">{popup.destination.address || `${popup.destination.lat.toFixed(3)}, ${popup.destination.lng.toFixed(3)}`}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPopup(null)}
                className="flex-1 py-3 rounded-xl text-sm font-medium"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#7070A0" }}
              >
                Geç
              </button>
              <button
                onClick={() => handleAccept(popup)}
                disabled={loading === popup.id}
                className="flex-[2] py-3 rounded-xl font-semibold text-white text-sm"
                style={{ background: "linear-gradient(135deg, #FF6B35, #e5521e)" }}
              >
                {loading === popup.id ? "Alınıyor..." : "✓ Kabul Et"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-display text-2xl tracking-wider" style={{ color: "#FF6B35" }}>SÜRÜCÜ PANELİ</h1>
            <p className="text-xs" style={{ color: "#7070A0" }}>{phone}</p>
          </div>
          <button onClick={onLogout} className="text-xs px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.05)", color: "#7070A0" }}>
            Çıkış
          </button>
        </div>

        {/* Online toggle */}
        <button
          onClick={handleToggleOnline}
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl"
          style={{
            background: isOnline ? "rgba(76,175,80,0.12)" : "rgba(255,255,255,0.04)",
            border: `2px solid ${isOnline ? "rgba(76,175,80,0.4)" : "rgba(255,255,255,0.1)"}`,
            transition: "all 0.3s"
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: isOnline ? "rgba(76,175,80,0.2)" : "rgba(255,255,255,0.06)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" fill={isOnline ? "#4CAF50" : "#7070A0"}/>
                <path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.93 4.93l2.12 2.12m9.9 9.9l2.12 2.12M4.93 19.07l2.12-2.12m9.9-9.9l2.12-2.12" stroke={isOnline ? "#4CAF50" : "#7070A0"} strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold" style={{ color: isOnline ? "#4CAF50" : "#7070A0" }}>
                {isOnline ? "Çevrimiçi" : "Çevrimdışı"}
              </p>
              <p className="text-xs" style={{ color: "#5A5A80" }}>
                {isOnline ? "İş alabilirsiniz" : "Şu anda çevrimdışısınız"}
              </p>
            </div>
          </div>
          <div className="w-12 h-6 rounded-full relative"
            style={{ background: isOnline ? "#4CAF50" : "rgba(255,255,255,0.1)" }}>
            <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
              style={{
                left: isOnline ? "calc(100% - 22px)" : "2px",
                transition: "left 0.2s"
              }} />
          </div>
        </button>

        {/* Stats */}
        {(earnings > 0 || completedCount > 0) && (
          <div className="flex gap-2 mt-3">
            <div className="flex-1 p-3 rounded-xl" style={{ background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.15)" }}>
              <p className="text-xs" style={{ color: "#7070A0" }}>Bugün kazanç</p>
              <p className="font-bold" style={{ color: "#FF6B35" }}>{earnings.toLocaleString("tr-TR")} ₺</p>
            </div>
            <div className="flex-1 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs" style={{ color: "#7070A0" }}>Tamamlanan</p>
              <p className="font-bold text-white">{completedCount} iş</p>
            </div>
            {driverLocation && (
              <div className="flex-1 p-3 rounded-xl" style={{ background: "rgba(76,175,80,0.08)", border: "1px solid rgba(76,175,80,0.15)" }}>
                <p className="text-xs" style={{ color: "#7070A0" }}>GPS</p>
                <p className="text-xs font-medium" style={{ color: "#4CAF50" }}>Aktif ✓</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        {/* Active request */}
        {activeRequest && (
          <div className="mb-4 animate-fade-in">
            <p className="text-xs uppercase tracking-wider mb-2 px-1" style={{ color: "#7070A0" }}>Aktif İş</p>
            <div className="rounded-2xl p-4" style={{
              background: "rgba(20,20,40,0.9)",
              border: "2px solid rgba(255,107,53,0.4)"
            }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-white">{VEHICLE_LABELS[activeRequest.vehicleType]}</span>
                <span className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{
                    background: `${statusLabels[activeRequest.status]?.color}20`,
                    color: statusLabels[activeRequest.status]?.color,
                    border: `1px solid ${statusLabels[activeRequest.status]?.color}40`
                  }}>
                  {statusLabels[activeRequest.status]?.label}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: "#FF6B35" }} />
                  <p className="text-sm text-white">{activeRequest.pickup.address || "Alış noktası"}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: "#4CAF50" }} />
                  <p className="text-sm text-white">{activeRequest.destination.address || "Hedef"}</p>
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <div className="flex-1 p-2 rounded-lg text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <p className="text-xs" style={{ color: "#7070A0" }}>Mesafe</p>
                  <p className="text-sm font-semibold text-white">{activeRequest.distanceKm.toFixed(1)} km</p>
                </div>
                <div className="flex-1 p-2 rounded-lg text-center" style={{ background: "rgba(255,107,53,0.08)" }}>
                  <p className="text-xs" style={{ color: "#7070A0" }}>Kazanç</p>
                  <p className="text-sm font-bold" style={{ color: "#FF6B35" }}>{activeRequest.price.toLocaleString("tr-TR")} ₺</p>
                </div>
              </div>

              {activeRequest.userPhone && (
                <a href={`tel:${activeRequest.userPhone}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium mb-3"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C9.6 21 3 14.4 3 6c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" stroke="white" strokeWidth="2"/>
                  </svg>
                  Müşteriyi Ara
                </a>
              )}

              <div className="flex gap-2">
                {activeRequest.status === "accepted" && (
                  <button
                    onClick={() => handleStatusUpdate("on_way")}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #2196F3, #1565C0)" }}
                  >
                    🚛 Yola Çıktım
                  </button>
                )}
                {activeRequest.status === "on_way" && (
                  <button
                    onClick={() => handleStatusUpdate("arrived")}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #9C27B0, #6A1B9A)" }}
                  >
                    📍 Varıldı
                  </button>
                )}
                {activeRequest.status === "arrived" && (
                  <button
                    onClick={() => handleStatusUpdate("completed")}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #4CAF50, #2E7D32)" }}
                  >
                    ✅ Tamamlandı
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Available jobs */}
        {isOnline && !activeRequest && (
          <div>
            <p className="text-xs uppercase tracking-wider mb-2 px-1" style={{ color: "#7070A0" }}>
              Açık İşler ({requests.length})
            </p>
            {requests.length === 0 ? (
              <div className="text-center py-12 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.08)" }}>
                <div className="text-4xl mb-3 car-animate">🚛</div>
                <p className="text-sm" style={{ color: "#5A5A80" }}>İş bekleniyor...</p>
                <p className="text-xs mt-1" style={{ color: "#3A3A60" }}>Yeni iş geldiğinde bildirim alacaksınız</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div key={req.id} className="rounded-2xl p-4 animate-fade-in"
                    style={{ background: "rgba(20,20,40,0.9)", border: "1px solid rgba(255,107,53,0.2)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{req.vehicleType === "sedan" ? "🚗" : req.vehicleType === "suv" ? "🚙" : "🛻"}</span>
                        <span className="font-medium text-white">{VEHICLE_LABELS[req.vehicleType]}</span>
                      </div>
                      <span className="font-bold text-lg" style={{ color: "#FF6B35" }}>
                        {req.price.toLocaleString("tr-TR")} ₺
                      </span>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#FF6B35" }} />
                        <p className="text-xs text-white leading-tight">{req.pickup.address || `${req.pickup.lat.toFixed(3)}, ${req.pickup.lng.toFixed(3)}`}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#4CAF50" }} />
                        <p className="text-xs text-white leading-tight">{req.destination.address || `${req.destination.lat.toFixed(3)}, ${req.destination.lng.toFixed(3)}`}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: "#7070A0" }}>{req.distanceKm.toFixed(1)} km</span>
                      <button
                        onClick={() => handleAccept(req)}
                        disabled={loading === req.id}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                        style={{ background: loading === req.id ? "rgba(255,107,53,0.4)" : "linear-gradient(135deg, #FF6B35, #e5521e)" }}
                      >
                        {loading === req.id ? "Alınıyor..." : "Kabul Et"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!isOnline && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 opacity-30">💤</div>
            <p className="text-sm" style={{ color: "#5A5A80" }}>Çevrimiçi olun, iş almaya başlayın</p>
          </div>
        )}
      </div>
    </div>
  );
}
