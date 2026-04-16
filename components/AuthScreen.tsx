"use client";

import { useState, useRef, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

interface AuthScreenProps {
  userType: "user" | "driver";
  onSuccess: (uid: string, phone: string) => void;
}

export default function AuthScreen({ userType, onSuccess }: AuthScreenProps) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [countdown, setCountdown] = useState(0);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const setupRecaptcha = () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
      });
    }
    return recaptchaRef.current;
  };

  const sendOtp = async () => {
    setError("");
    const cleaned = phone.replace(/\s/g, "");
    if (cleaned.length < 10) {
      setError("Geçerli bir telefon numarası girin");
      return;
    }
    const formatted = cleaned.startsWith("+90") ? cleaned : `+90${cleaned.replace(/^0/, "")}`;
    setLoading(true);
    try {
      const verifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, formatted, verifier);
      setConfirmation(result);
      setStep("otp");
      setCountdown(60);
    } catch (e: any) {
      setError("SMS gönderilemedi: " + (e.message || "Tekrar deneyin"));
      recaptchaRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!confirmation) return;
    setError("");
    if (otp.length !== 6) {
      setError("6 haneli kodu girin");
      return;
    }
    setLoading(true);
    try {
      const result = await confirmation.confirm(otp);
      const user = result.user;
      onSuccess(user.uid, user.phoneNumber || phone);
    } catch (e: any) {
      setError("Kod hatalı veya süresi dolmuş");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0D0D1A 0%, #141428 100%)" }}>

      <div id="recaptcha-container" ref={containerRef} />

      <div className="w-full max-w-sm animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #FF6B35, #e5521e)" }}>
            {userType === "driver" ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h18M3 12L6 9m-3 3l3 3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <rect x="1" y="10" width="14" height="8" rx="2" stroke="white" strokeWidth="2"/>
                <circle cx="6" cy="19" r="2" fill="white"/>
                <circle cx="14" cy="19" r="2" fill="white"/>
                <path d="M15 14h5l2-4h-7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <h2 className="font-display text-3xl tracking-wider" style={{ color: "#FF6B35" }}>
            {userType === "driver" ? "SÜRÜCÜ GİRİŞİ" : "KULLANICI GİRİŞİ"}
          </h2>
          <p className="text-sm mt-1" style={{ color: "#7070A0" }}>
            {step === "phone" ? "Telefon numaranı gir" : "SMS kodunu gir"}
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl p-6" style={{
          background: "rgba(20,20,40,0.8)",
          border: "1px solid rgba(255,107,53,0.15)"
        }}>
          {step === "phone" ? (
            <>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "#7070A0" }}>
                Telefon Numarası
              </label>
              <div className="flex gap-2 mb-4">
                <div className="flex items-center px-3 rounded-xl text-sm font-medium"
                  style={{ background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.2)", color: "#FF6B35" }}>
                  🇹🇷 +90
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/[^0-9\s]/g, ""))}
                  placeholder="5XX XXX XX XX"
                  maxLength={13}
                  className="flex-1 px-4 py-3 rounded-xl text-white text-base outline-none"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onKeyDown={e => e.key === "Enter" && sendOtp()}
                />
              </div>
              {error && (
                <p className="text-xs mb-3 px-3 py-2 rounded-lg" style={{ background: "rgba(233,69,96,0.1)", color: "#E94560" }}>
                  {error}
                </p>
              )}
              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full py-4 rounded-xl font-semibold text-white text-base relative overflow-hidden"
                style={{
                  background: loading ? "rgba(255,107,53,0.4)" : "linear-gradient(135deg, #FF6B35, #e5521e)",
                  transition: "all 0.2s"
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Gönderiliyor...
                  </span>
                ) : "SMS Kodu Gönder"}
              </button>
            </>
          ) : (
            <>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "#7070A0" }}>
                Doğrulama Kodu
              </label>
              <p className="text-xs mb-3" style={{ color: "#5A5A80" }}>
                +90{phone.replace(/^0/, "")} numarasına SMS gönderildi
              </p>
              <input
                type="tel"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •"
                maxLength={6}
                className="w-full px-4 py-4 rounded-xl text-white text-2xl text-center tracking-[0.5em] outline-none mb-4"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  letterSpacing: "0.5em"
                }}
                onKeyDown={e => e.key === "Enter" && verifyOtp()}
                autoFocus
              />
              {error && (
                <p className="text-xs mb-3 px-3 py-2 rounded-lg" style={{ background: "rgba(233,69,96,0.1)", color: "#E94560" }}>
                  {error}
                </p>
              )}
              <button
                onClick={verifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full py-4 rounded-xl font-semibold text-white text-base mb-3"
                style={{
                  background: (loading || otp.length !== 6) ? "rgba(255,107,53,0.3)" : "linear-gradient(135deg, #FF6B35, #e5521e)",
                  transition: "all 0.2s"
                }}
              >
                {loading ? "Doğrulanıyor..." : "Doğrula ve Giriş Yap"}
              </button>
              <button
                onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
                className="w-full py-2 text-sm"
                style={{ color: "#7070A0" }}
              >
                ← Numarayı değiştir
              </button>
              {countdown > 0 && (
                <p className="text-center text-xs mt-2" style={{ color: "#5A5A80" }}>
                  Tekrar gönder: {countdown}s
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
