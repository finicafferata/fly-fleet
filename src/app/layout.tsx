import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/Analytics";
import { ReCaptchaLoader } from "@/components/ReCaptchaLoader";
import { ReCaptchaDebug } from "@/components/ReCaptchaDebug";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Fly-Fleet | Private Jet Charter Services",
    template: "%s | Fly-Fleet"
  },
  description: "Premium private jet charter services across Latin America. Certified operators, 24/7 support, and hassle-free booking.",
  icons: {
    icon: [
      { url: '/icon.png?v=5', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=5', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReCaptchaLoader />
        <ReCaptchaDebug />
        <Analytics />
        {children}
      </body>
    </html>
  );
}
