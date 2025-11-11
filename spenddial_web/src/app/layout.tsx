import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import PWAInstaller from "@/components/PWAInstaller";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SpendDial - Smart Budget Tracker",
  description: "Track your spending with a real-time budget dial. Connect your bank accounts and stay on budget every day.",
  applicationName: "SpendDial",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SpendDial",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="apple-touch-icon" href="/icon-192.png" />
        </head>
        <body className={inter.className}>
          {children}
          <PWAInstaller />
        </body>
      </html>
    </ClerkProvider>
  );
}
