import type { Metadata, Viewport } from "next";
import { Comfortaa, Poor_Story } from "next/font/google";
import "./globals.css";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-comfortaa",
});

const poorStory = Poor_Story({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-poor-story",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "Booklool",
  description: "책 그림일기 — 아이와 함께 읽은 책을 기록해요",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Booklool",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${comfortaa.variable} ${poorStory.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
