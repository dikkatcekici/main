import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bursa Çekici | En Yakın Yol Yardım",
  description:
    "Bursa'da 7/24 en yakın çekici ve yol yardım hizmeti. Binek, SUV ve kamyonet için anında fiyat al, dakikalar içinde yardım al.",
  keywords: "çekici, yol yardım, Bursa çekici, oto çekici, araç kurtarma",
  openGraph: {
    title: "Bursa Çekici | En Yakın Yol Yardım",
    description: "Bursa'da 7/24 çekici ve yol yardım hizmeti",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
