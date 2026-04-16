# 🚛 Çekici - Yol Yardım Uygulaması

Lokasyon bazlı, gerçek zamanlı çekici eşleştirme sistemi.

---

## ⚡ Hızlı Başlangıç

### 1. Bağımlılıkları kur
```bash
npm install
```

### 2. Firebase Projesi Oluştur

1. [Firebase Console](https://console.firebase.google.com) → "Add project"
2. **Authentication** → Sign-in method → **Phone** → Enable
3. **Firestore Database** → Create database → Production mode
4. **Project Settings** → Web app ekle → Config'i kopyala

### 3. Google Maps API Key Al

1. [Google Cloud Console](https://console.cloud.google.com) → APIs & Services
2. Şunları etkinleştir:
   - Maps JavaScript API
   - Distance Matrix API
   - Geocoding API
3. API key oluştur (HTTP referrer kısıtlaması ekle)

### 4. .env.local Oluştur

`.env.local.example` dosyasını `.env.local` olarak kopyala:
```bash
cp .env.local.example .env.local
```

Değerleri doldur:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

### 5. Firestore Güvenlik Kurallarını Uygula

Firebase Console → Firestore → Rules → `firestore.rules` içeriğini yapıştır.

### 6. Çalıştır

```bash
npm run dev
```

`http://localhost:3000` aç.

---

## 📱 Kullanım

### Kullanıcı Akışı
1. `/` → "Araç Sahibiyim" seç
2. Telefon ile giriş yap (SMS OTP)
3. Araç tipi seç (Binek / SUV / Kamyonet)
4. Konumunu al veya haritadan seç
5. Hedef konumu haritadan seç
6. "Fiyat Hesapla" → fiyatı onayla
7. "Çekici Çağır" → çekiciyi bekle
8. Kabul edilince canlı takip ekranı açılır

### Sürücü Akışı
1. `/driver` → "Çekici Sürücüsüyüm" seç
2. Telefon ile giriş yap
3. "Çevrimiçi" toggle'ını aç
4. Gelen işleri görün, popup gelir
5. "Kabul Et" → "Yola Çıktım" → "Varıldı" → "Tamamlandı"

---

## 🏗️ Mimari

```
Kullanıcı → createRequest() → Firestore /requests
                                     ↓
Tüm online çekiciler    ← listenToSearchingRequests()
                                     ↓
İlk kabul eden        → acceptRequest() [Transaction]
                                     ↓
Kullanıcı             ← listenToRequest() [Realtime]
                                     ↓
Çekici konum          → trackLocation() → /drivers/{id}
                                     ↓
Kullanıcı             ← listenToDriverLocation() [Realtime]
```

---

## 💰 Fiyatlandırma

| Araç | Baz | km ücreti |
|------|-----|-----------|
| Binek | 1.500 ₺ | 22 ₺/km |
| SUV | 1.500 ₺ | 27 ₺/km |
| Kamyonet | 1.500 ₺ | 32 ₺/km |

---

## 🔐 Firebase Auth - Test Telefon Numaraları

Geliştirme sırasında Firebase Console → Authentication → Phone → Test phone numbers:
- Numara: `+90 555 000 0000` → Kod: `123456`

---

## 📦 Deploy

```bash
npm run build
# Vercel, Netlify veya Firebase Hosting
```

Firebase Hosting için:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```
