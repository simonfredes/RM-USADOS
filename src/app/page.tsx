import { getHomePageData } from "./actions";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Navigation from "./components/Navigation";
import BrandMarquee from "./components/BrandMarquee";
import BrandStory from "./components/BrandStory";
import BudgetSearch from "./components/BudgetSearch";
import Contact from "./components/Contact";
import PremiumSelection from "./components/PremiumSelection";
import PurchaseExperience from "./components/PurchaseExperience";
import { getVehicles } from "./vehiculos/actions";
import type { Metadata } from "next";
import { BUSINESS_GEO, SITE_URL, absoluteUrl, jsonLd } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const selectedVehicle = typeof params.unidad === "string" ? params.unidad.slice(0, 200) : undefined;
  const [pageData, vehicles] = await Promise.all([getHomePageData(), getVehicles()]);
  const dealer = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: "RM Usados",
    url: SITE_URL,
    logo: absoluteUrl("/logos/LOGO-RM.png"),
    description: "Autos usados seleccionados, principalmente BMW, en Bahía Blanca.",
    telephone: pageData.contact.phoneHref.replace("tel:", ""),
    address: { "@type": "PostalAddress", streetAddress: pageData.contact.address, postalCode: "B8000", addressLocality: "Bahía Blanca", addressRegion: "Buenos Aires", addressCountry: "AR" },
    geo: { "@type": "GeoCoordinates", ...BUSINESS_GEO },
    hasMap: pageData.contact.mapsHref,
    email: pageData.contact.email,
    image: absoluteUrl("/images/RM%20Usados-3.JPEG"),
    areaServed: { "@type": "City", name: "Bahía Blanca" },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" },
    ],
    brand: { "@type": "Brand", name: "BMW" },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(dealer)} />
      <Navigation contact={pageData.contact} />
      <main id="contenido" tabIndex={-1}>
        <Hero content={pageData.hero} vehicles={vehicles} />
        <BrandMarquee />
        <PremiumSelection vehicles={vehicles} />
        <BudgetSearch vehicles={vehicles} />
        <BrandStory />
        <PurchaseExperience />
        <Contact contact={pageData.contact} selectedVehicle={selectedVehicle} />
      </main>
      <Footer contact={pageData.contact} />
    </>
  );
}
