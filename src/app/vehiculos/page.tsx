import type { Metadata } from "next";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";
import { getHomePageData } from "../actions";
import { getVehicles } from "./actions";
import CatalogHero from "./components/CatalogHero";
import VehicleGrid from "./components/VehicleGrid";

export const metadata: Metadata = {
  title: "Vehículos premium usados | RM Usados",
  description: "Conocé el stock seleccionado de autos y SUV premium usados de RM Usados: Audi, Mercedes-Benz, BMW, Porsche y más.",
  alternates: { canonical: "/vehiculos" },
  openGraph: {
    title: "Vehículos premium usados | RM Usados",
    description: "Una selección de autos y SUV de alta gama elegidos con criterio.",
    type: "website",
    locale: "es_AR",
  },
};

export default async function VehiclesPage({ searchParams }: PageProps<"/vehiculos">) {
  const params = await searchParams;
  const value = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const [vehicles, homeData] = await Promise.all([getVehicles(), getHomePageData()]);
  const initialFilters = {
    query: value("q"),
    brand: value("marca"),
    bodyType: value("carroceria"),
    sort: ["year", "mileage"].includes(value("orden")) ? value("orden") : "",
  };

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
