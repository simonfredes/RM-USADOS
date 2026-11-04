import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import VisualEffects from "./components/VisualEffects";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const DESCRIPTION = "Autos usados seleccionados, principalmente BMW, con atención personalizada en Bahía Blanca.";

// El canonical no va acá: lo heredaría cualquier página sin canonical propio y apuntaría a la portada.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "RM Usados | Autos usados seleccionados en Bahía Blanca", template: "%s | RM Usados" },
  description: DESCRIPTION,
  applicationName: "RM Usados",
  keywords: ["autos usados Bahía Blanca", "BMW usados", "usados seleccionados", "concesionaria de usados", "RM Usados"],
  formatDetection: { telephone: false },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: { siteName: "RM Usados", locale: "es_AR", type: "website", description: DESCRIPTION },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

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
