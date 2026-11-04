import type { Metadata } from "next";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";
import { getHomePageData } from "../actions";
import { getVehicles } from "./actions";
import CatalogHero from "./components/CatalogHero";
import VehicleGrid from "./components/VehicleGrid";
import { parseFilters } from "@/lib/vehicles/filters";
import { vehiclePath, vehicleTitle } from "@/lib/vehicles/vehicle";
import { DEFAULT_OG_IMAGE, absoluteUrl, jsonLd } from "@/lib/site";

export const metadata: Metadata = {
  title: "Autos usados en Bahía Blanca",
  description: "Stock de autos y SUV usados seleccionados en Bahía Blanca: BMW, Audi, Mercedes-Benz y más. Fotos, kilometraje y consulta directa por WhatsApp.",
  alternates: { canonical: "/vehiculos" },
  openGraph: {
    title: "Autos usados en Bahía Blanca | RM Usados",
    description: "Una selección de autos y SUV de alta gama elegidos con criterio.",
    url: "/vehiculos",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function VehiclesPage({ searchParams }: PageProps<"/vehiculos">) {
  const params = await searchParams;
  const value = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const [vehicles, homeData] = await Promise.all([getVehicles(), getHomePageData()]);
  const initialFilters = parseFilters(value);
  // Lista del stock para buscadores: cada unidad enlaza a su ficha, que tiene los datos completos.
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Autos usados en Bahía Blanca",
    numberOfItems: vehicles.length,
    itemListElement: vehicles.map((vehicle, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(vehiclePath(vehicle)),
      name: `${vehicleTitle(vehicle)} ${vehicle.year}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(itemList)} />
      <Navigation contact={homeData.contact} />
      <main id="contenido" tabIndex={-1}>
        <CatalogHero total={vehicles.length} />
        <VehicleGrid key={JSON.stringify(initialFilters)} vehicles={vehicles} initialFilters={initialFilters} />
      </main>
      <Footer contact={homeData.contact} />
    </>
  );
}
