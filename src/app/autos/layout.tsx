import { getHomePageData } from "../actions";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";

/** Header y footer viven en el layout: siguen visibles mientras la ficha del auto carga. */
export default async function VehicleLayout({ children }: LayoutProps<"/autos">) {
  const { contact } = await getHomePageData();
  return (
    <>
      <Navigation contact={contact} />
      <main id="contenido" tabIndex={-1} className="vehicle-page">{children}</main>
      <Footer contact={contact} />
    </>
  );
}
