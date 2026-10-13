import type { Metadata } from "next";
import { Inter } from "next/font/google";
import VisualEffects from "./components/VisualEffects";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "RM Usados | Autos usados seleccionados en Bahía Blanca", template: "%s | RM Usados" },
  description: "Autos usados seleccionados, principalmente BMW, con atención personalizada en Bahía Blanca.",
  alternates: { canonical: "/" },
  openGraph: { siteName: "RM Usados", locale: "es_AR", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${inter.variable} antialiased`}
    >
      <body>
        <a href="#contenido" className="skip-link">Ir al contenido</a>
        <VisualEffects />
        {children}
      </body>
    </html>
  );
}
