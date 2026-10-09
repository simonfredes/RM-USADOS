import type { Metadata } from "next";
import { Inter } from "next/font/google";
import VisualEffects from "./components/VisualEffects";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RM Usados | Usados seleccionados",
  description: "Vehículos usados seleccionados y atención personalizada en Salta.",
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
