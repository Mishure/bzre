import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BESTINVEST CAMIMOB - Agentie Imobiliara Buzau",
  description: "Agentie imobiliara moderna din Buzau. Oferte de calitate pentru apartamente, case, terenuri si spatii comerciale. Tranzactii sigure.",
  keywords: "agentii imobiliare Buzau, anunturi imobiliare Buzau, proprietati Buzau",
  authors: [{ name: "BESTINVEST CAMIMOB" }],
  openGraph: {
    title: "BESTINVEST CAMIMOB - Agentie Imobiliara Buzau",
    description: "Agentie imobiliara moderna din Buzau. Oferte de calitate pentru apartamente, case, terenuri si spatii comerciale.",
    url: "https://bestinvest-buzau.vercel.app",
    siteName: "BESTINVEST CAMIMOB",
    locale: "ro_RO",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
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
      </body>
    </html>
  );
}