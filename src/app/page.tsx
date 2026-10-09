import { getHomePageData } from "./actions";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Navigation from "./components/Navigation";
import BrandStory from "./components/BrandStory";
import Contact from "./components/Contact";
import PremiumSelection from "./components/PremiumSelection";
import PurchaseExperience from "./components/PurchaseExperience";
import { getVehicles } from "./vehiculos/actions";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const selectedVehicle = typeof params.unidad === "string" ? params.unidad.slice(0, 200) : undefined;
  const [pageData, vehicles] = await Promise.all([getHomePageData(), getVehicles()]);
  return (
    <>
      <Navigation contact={pageData.contact} />
      <main id="contenido" tabIndex={-1}>
        <Hero content={pageData.hero} vehicles={vehicles} />
        <PremiumSelection vehicles={vehicles} />
        <BrandStory />
        <PurchaseExperience />
        <Contact contact={pageData.contact} selectedVehicle={selectedVehicle} />
      </main>
      <Footer contact={pageData.contact} />
    </>
  );
}
