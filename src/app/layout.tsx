import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sistem Pengajuan Modal | FINNOVA MST",
  description: "Platform Pengajuan Modal Kebutuhan Usaha & Keuangan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased font-sans`}
    >
      <body className={`${plusJakartaSans.className} min-h-full flex flex-col font-sans bg-[#f6f7fb] text-zinc-900`}>
        {children}
      </body>
    </html>
  );
}
