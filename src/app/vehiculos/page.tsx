import type { Metadata } from "next";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";
import { getHomePageData } from "../actions";
import { getVehicles } from "./actions";
import CatalogHero from "./components/CatalogHero";
import VehicleGrid from "./components/VehicleGrid";
import { parseFilters } from "@/lib/vehicles/filters";

export const metadata: Metadata = {
  title: "Autos usados en Bahía Blanca",
  description: "Stock de autos y SUV usados seleccionados en Bahía Blanca: BMW, Audi, Mercedes-Benz y más. Fotos, kilometraje y consulta directa por WhatsApp.",
  alternates: { canonical: "/vehiculos" },
  openGraph: {
    title: "Autos usados en Bahía Blanca | RM Usados",
    description: "Una selección de autos y SUV de alta gama elegidos con criterio.",
    url: "/vehiculos",
  },
};

export default async function VehiclesPage({ searchParams }: PageProps<"/vehiculos">) {
  const params = await searchParams;
  const value = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const [vehicles, homeData] = await Promise.all([getVehicles(), getHomePageData()]);
  const initialFilters = parseFilters(value);

  return (
    <>
      <Navigation contact={homeData.contact} />
      <main id="contenido" tabIndex={-1}>
        <CatalogHero total={vehicles.length} />
        <VehicleGrid key={JSON.stringify(initialFilters)} vehicles={vehicles} initialFilters={initialFilters} />
      </main>
      <Footer contact={homeData.contact} />
    </>
  );
}
