import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from 'react-hot-toast';
import { CookieConsentProvider } from '@/contexts/CookieConsentContext';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import { LanguageProvider } from '@/contexts/LanguageContext';
import LanguageMetadata from '@/components/LanguageMetadata';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BESTINVEST CAMIMOB - Agentie Imobiliara Buzau",
  description: "Agentie imobiliara moderna din Buzau. Oferte de calitate pentru apartamente, case, terenuri si spatii comerciale. Tranzactii sigure. Gaseste-ti casa visurilor cu cei mai buni agenti imobiliari din Buzau.",
  keywords: "agentii imobiliare Buzau, anunturi imobiliare Buzau, proprietati Buzau, apartamente de vanzare Buzau, apartamente de inchiriat Buzau, case de vanzare Buzau, terenuri de vanzare Buzau, spatii comerciale Buzau, imobiliare Buzau centru, imobiliare Buzau Micro 3, imobiliare Buzau Micro 4, garsoniere Buzau, apartamente 2 camere Buzau, apartamente 3 camere Buzau, case Buzau, agentie imobiliara profesionista Buzau, evaluare proprietate Buzau, consultanta imobiliara Buzau, BESTINVEST CAMIMOB, CAMIMOB, agent imobiliar Buzau, tranzactii imobiliare Buzau, imobile Buzau",
  authors: [{ name: "BESTINVEST CAMIMOB" }],
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: "BESTINVEST CAMIMOB - Agentie Imobiliara Buzau",
    description: "Agentie imobiliara moderna din Buzau. Oferte de calitate pentru apartamente, case, terenuri si spatii comerciale. Tranzactii sigure. Gaseste-ti casa visurilor cu cei mai buni agenti imobiliari din Buzau.",
    url: "https://www.camimob.ro",
    siteName: "BESTINVEST CAMIMOB",
    locale: "ro_RO",
    type: "website",
    images: [
      {
        url: 'https://www.camimob.ro/imagecam.png',
        width: 400,
        height: 400,
        alt: 'BESTINVEST CAMIMOB - Agentie Imobiliara Buzau',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CAMIMOB',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <LanguageProvider>
          <CookieConsentProvider>
            <LanguageMetadata />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                success: {
                  style: {
                    background: '#10b981',
                    color: '#fff',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                    color: '#fff',
                  },
                },
              }}
            />
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <CookieConsentBanner />
          </CookieConsentProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}