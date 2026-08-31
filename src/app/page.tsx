import { getHomePageData } from "./actions";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Navigation from "./components/Navigation";
import BrandStory from "./components/BrandStory";
import Contact from "./components/Contact";
import PremiumSelection from "./components/PremiumSelection";
import PurchaseExperience from "./components/PurchaseExperience";

export default async function HomePage() {
  const pageData = await getHomePageData();
  return <><Navigation contact={pageData.contact} /><main><Hero content={pageData.hero} /><PremiumSelection vehicles={pageData.vehicles} /><BrandStory /><PurchaseExperience /><Contact contact={pageData.contact} /></main><Footer contact={pageData.contact} /></>;
}
