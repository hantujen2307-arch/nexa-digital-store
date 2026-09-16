import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { STORE_NAME, STORE_DESCRIPTION } from "@/data/config";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: `${STORE_NAME} — Aplikasi Premium & Digital Service`,
  description: STORE_DESCRIPTION,
  keywords: [
    "aplikasi premium murah",
    "canva pro",
    "capcut pro",
    "chatgpt plus",
    "spotify premium",
    "youtube premium",
    "netflix",
    "jasa editing video tiktok reels",
    "promo tiket bioskop xxi m-tix",
    "diskon tiket cgv cinepolis",
  ],
  authors: [{ name: STORE_NAME }],
  openGraph: {
    title: `${STORE_NAME} — Aplikasi Premium & Digital Service`,
    description: STORE_DESCRIPTION,
    type: "website",
    locale: "id_ID",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

import { AdminPortalProvider } from "@/context/AdminPortalContext";
import AdminLoginModal from "@/components/admin/AdminLoginModal";
import AdminPanelOverlay from "@/components/admin/AdminPanelOverlay";
import FloatingAdminPill from "@/components/admin/FloatingAdminPill";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} dark scroll-smooth`}>
      <body className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-cyan-500 selection:text-zinc-950">
        <AdminPortalProvider>
          {children}
          <AdminLoginModal />
          <AdminPanelOverlay />
          <FloatingAdminPill />
        </AdminPortalProvider>
      </body>
    </html>
  );
}
