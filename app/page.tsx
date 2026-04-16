"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0D0D1A 0%, #141428 50%, #0D0D1A 100%)" }}>

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #FF6B35, transparent)" }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #FF6B35, transparent)" }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,107,53,0.5) 60px, rgba(255,107,53,0.5) 61px), repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,107,53,0.5) 60px, rgba(255,107,53,0.5) 61px)"
          }} />
      </div>

      <div className="relative z-10 w-full max-w-sm animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #FF6B35, #e5521e)" }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
              <path d="M3 12h18M3 12L6 9m-3 3l3 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="1" y="10" width="14" height="8" rx="2" stroke="white" strokeWidth="2"/>
              <circle cx="6" cy="19" r="2" fill="white"/>
              <circle cx="14" cy="19" r="2" fill="white"/>
              <path d="M15 14h5l2-4h-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="font-display text-5xl tracking-wider mb-2" style={{ color: "#FF6B35" }}>
            ÇEKİCİ
          </h1>
          <p className="text-sm" style={{ color: "#7070A0" }}>
            Bursa'nın En Hızlı Yol Yardım Servisi
          </p>
        </div>

        {/* Role selection */}
        <div className="space-y-4">
          <button
            onClick={() => router.push("/user")}
            onMouseEnter={() => setHovered("user")}
            onMouseLeave={() => setHovered(null)}
            className="w-full p-5 rounded-2xl text-left relative overflow-hidden group"
            style={{
              background: hovered === "user"
                ? "linear-gradient(135deg, #FF6B35, #e5521e)"
                : "rgba(255,107,53,0.08)",
              border: "1px solid rgba(255,107,53,0.3)",
              transition: "all 0.25s",
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: hovered === "user" ? "rgba(255,255,255,0.2)" : "rgba(255,107,53,0.2)"
                }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold text-white text-lg">Araç Sahibiyim</div>
                <div className="text-sm mt-0.5" style={{ color: hovered === "user" ? "rgba(255,255,255,0.8)" : "#7070A0" }}>
                  Yol yardımı çağır
                </div>
              </div>
              <svg className="ml-auto" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </button>

          <button
            onClick={() => router.push("/driver")}
            onMouseEnter={() => setHovered("driver")}
            onMouseLeave={() => setHovered(null)}
            className="w-full p-5 rounded-2xl text-left relative overflow-hidden"
            style={{
              background: hovered === "driver"
                ? "rgba(255,107,53,0.15)"
                : "rgba(255,255,255,0.03)",
              border: hovered === "driver"
                ? "1px solid rgba(255,107,53,0.5)"
                : "1px solid rgba(255,255,255,0.08)",
              transition: "all 0.25s",
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.06)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12h18M3 12L6 9m-3 3l3 3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <rect x="1" y="10" width="14" height="8" rx="2" stroke="white" strokeWidth="2"/>
                  <circle cx="6" cy="19" r="2" fill="white"/>
                  <circle cx="14" cy="19" r="2" fill="white"/>
                  <path d="M15 14h5l2-4h-7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold text-white text-lg">Çekici Sürücüsüyüm</div>
                <div className="text-sm mt-0.5" style={{ color: "#7070A0" }}>
                  İş al ve kazan
                </div>
              </div>
              <svg className="ml-auto" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </button>
        </div>

        <p className="text-center text-xs mt-8" style={{ color: "#4A4A70" }}>
          7/24 hizmet • Bursa geneli • Anında eşleştirme
        </p>
      </div>
    </main>
  );
}
