"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import AuthScreen from "@/components/AuthScreen";
import DriverPanel from "@/components/DriverPanel";

export default function DriverPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        setPhone(user.phoneNumber || "");
        await setDoc(doc(db, "drivers", user.uid), {
          id: user.uid,
          phone: user.phoneNumber,
          type: "driver",
          isOnline: false,
          updatedAt: Date.now(),
        }, { merge: true });
      } else {
        setUid(null);
      }
      setChecking(false);
    });
    return () => unsub();
  }, []);

  const handleAuthSuccess = async (userId: string, userPhone: string) => {
    setUid(userId);
    setPhone(userPhone);
    await setDoc(doc(db, "drivers", userId), {
      id: userId,
      phone: userPhone,
      type: "driver",
      isOnline: false,
      createdAt: Date.now(),
    }, { merge: true });
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUid(null);
    setPhone("");
  };

  if (checking) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: "#0D0D1A" }}>
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,107,53,0.2)" strokeWidth="3"/>
            <path d="M12 2a10 10 0 0110 10" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <p className="text-sm" style={{ color: "#7070A0" }}>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!uid) {
    return <AuthScreen userType="driver" onSuccess={handleAuthSuccess} />;
  }

  return <DriverPanel uid={uid} phone={phone} onLogout={handleLogout} />;
}
