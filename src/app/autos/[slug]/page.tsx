import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getHomePageData } from "../../actions";
import Arrow from "../../components/Arrow";
import Footer from "../../components/Footer";
import Navigation from "../../components/Navigation";
import { getVehicleBySlug, getVehicles } from "../../vehiculos/actions";
import VehicleCard from "../../vehiculos/components/VehicleCard";
import VehicleGallery from "./VehicleGallery";
import { absoluteUrl, jsonLd } from "@/lib/site";
import { getRelatedVehicles, vehiclePath, vehicleTitle, type Vehicle } from "@/lib/vehicles/vehicle";

const lower = (value: string) => value.toLocaleLowerCase("es");

/** Texto indexable armado solo con datos cargados: no promete nada que la unidad no tenga. */
function summary(vehicle: Vehicle) {
  const parts = [`${vehicleTitle(vehicle)} ${vehicle.year} usado`];
  if (vehicle.mileageValue !== null) parts.push(`con ${vehicle.mileage}`);
  if (vehicle.transmission !== "A consultar") parts.push(`transmisión ${lower(vehicle.transmission)}`);
  if (vehicle.fuel !== "A consultar") parts.push(`motor ${lower(vehicle.fuel)}${vehicle.engine ? ` de ${vehicle.engine}` : ""}`);
  return `${parts.join(", ")}. Disponible en RM Usados, ${vehicle.location}.`;
}

export async function generateMetadata({ params }: PageProps<"/autos/[slug]">): Promise<Metadata> {
  const vehicle = await getVehicleBySlug((await params).slug);
  if (!vehicle) return { title: "Vehículo no disponible", robots: { index: false } };

  const title = `${vehicleTitle(vehicle)} ${vehicle.year} usado`;
  // ~160 caracteres: datos clave, destacados y llamado a la acción.
  const facts = [vehicle.mileageValue !== null && `con ${vehicle.mileage}`, vehicle.transmission !== "A consultar" && `transmisión ${lower(vehicle.transmission)}`].filter(Boolean).join(", ");
  const description = [`${title}${facts ? ` ${facts}` : ""}.`, vehicle.highlights.length > 0 && `${vehicle.highlights.join(", ")}.`, `${vehicle.priceValue !== null ? `Precio: ${vehicle.price}` : "Consultá el precio"} en RM Usados, Bahía Blanca.`].filter(Boolean).join(" ");
  const path = vehiclePath(vehicle);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | RM Usados`,
      description,
      url: path,
      images: vehicle.images.slice(0, 4).map((url, i) => ({ url, alt: `${title}, foto ${i + 1}` })),
    },
  };
}

export default async function VehiclePage({ params }: PageProps<"/autos/[slug]">) {
  const { slug } = await params;
  const [vehicle, vehicles, { contact }] = await Promise.all([getVehicleBySlug(slug), getVehicles(), getHomePageData()]);
  if (!vehicle) notFound();

  const title = vehicleTitle(vehicle);
  const url = absoluteUrl(vehiclePath(vehicle));
  const related = getRelatedVehicles(vehicle, vehicles);
  const whatsapp = new URL(contact.whatsappHref);
  whatsapp.searchParams.set("text", `Hola ${contact.name}, quiero consultar por el ${title} ${vehicle.year} (${vehicle.mileage}): ${url}`);
  const specs = [
    ["Marca", vehicle.brand], ["Modelo", vehicle.model], ["Versión", vehicle.version || "A consultar"], ["Año", String(vehicle.year)],
    ["Kilometraje", vehicle.mileage], ["Combustible", vehicle.fuel], ["Transmisión", vehicle.transmission], ["Carrocería", vehicle.bodyType],
    ["Color", vehicle.color], ["Motor", vehicle.engine ?? "A consultar"], ["Ubicación", vehicle.location],
  ];

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Car",
      name: `${title} ${vehicle.year}`,
      url,
      description: summary(vehicle),
      image: vehicle.images,
      brand: { "@type": "Brand", name: vehicle.brand },
      model: vehicle.model,
      ...(vehicle.version && { vehicleConfiguration: vehicle.version }),
      vehicleModelDate: String(vehicle.year),
      itemCondition: "https://schema.org/UsedCondition",
      ...(vehicle.mileageValue !== null && { mileageFromOdometer: { "@type": "QuantitativeValue", value: vehicle.mileageValue, unitCode: "KMT" } }),
      ...(vehicle.fuel !== "A consultar" && { fuelType: vehicle.fuel }),
      ...(vehicle.transmission !== "A consultar" && { vehicleTransmission: vehicle.transmission }),
      ...(vehicle.bodyType !== "A consultar" && { bodyType: vehicle.bodyType }),
      ...(vehicle.color !== "A consultar" && { color: vehicle.color }),
      ...(vehicle.priceValue !== null && {
        offers: {
          "@type": "Offer", url, price: vehicle.priceValue, priceCurrency: vehicle.currency,
          availability: "https://schema.org/InStock", itemCondition: "https://schema.org/UsedCondition",
          seller: { "@type": "AutoDealer", name: "RM Usados", telephone: contact.phoneHref.replace("tel:", "") },
        },
      }),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Vehículos", item: absoluteUrl("/vehiculos") },
        { "@type": "ListItem", position: 3, name: `${title} ${vehicle.year}`, item: url },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />
      <Navigation contact={contact} />
      <main id="contenido" tabIndex={-1} className="vehicle-page">
        <div className="container">
          <nav aria-label="Ruta de navegación" className="breadcrumbs">
            <ol><li><Link href="/">Inicio</Link></li><li><Link href="/vehiculos">Vehículos</Link></li><li aria-current="page">{vehicle.brand} {vehicle.model}</li></ol>
          </nav>

          <div className="vehicle-detail">
            <VehicleGallery images={vehicle.images} title={`${title} ${vehicle.year}`} />

            <aside className="vehicle-summary" aria-labelledby="vehicle-title">
              <p className="eyebrow">{vehicle.brand} · {vehicle.year}</p>
              <h1 id="vehicle-title">{vehicle.brand} {vehicle.model}{vehicle.version && <span>{vehicle.version}</span>}</h1>
              <ul className="vehicle-keyfacts" aria-label="Datos principales"><li>{vehicle.year}</li><li>{vehicle.mileage}</li><li>{vehicle.transmission}</li></ul>
              <div className="vehicle-summary-price"><p className="vehicle-price-label">Precio de la unidad</p><p className="vehicle-price">{vehicle.price}</p></div>
              {vehicle.highlights.length > 0 && <ul className="vehicle-highlights" aria-label="Destacados">{vehicle.highlights.map((item) => <li key={item}>{item}</li>)}</ul>}
              <div className="vehicle-actions">
                <a href={whatsapp.toString()} target="_blank" rel="noreferrer" className="button button-accent">Consultar por WhatsApp <Arrow diagonal /></a>
                <a href={contact.phoneHref} className="button vehicle-call">Llamar a {contact.name} <Arrow diagonal /></a>
              </div>
              <p className="vehicle-summary-note">{contact.address}, {vehicle.location} · <a href={contact.mapsHref} target="_blank" rel="noreferrer">Cómo llegar</a></p>
            </aside>
          </div>

          <div className="vehicle-info">
            <section aria-labelledby="specs-title">
              <h2 id="specs-title" className="vehicle-info-title">Ficha técnica</h2>
              <dl className="vehicle-spec-table">{specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
            </section>
            <section aria-labelledby="about-title">
              <h2 id="about-title" className="vehicle-info-title">Sobre esta unidad</h2>
              <p className="vehicle-about">{summary(vehicle)}</p>
              {vehicle.highlights.length > 0 && <ul className="vehicle-checklist">{vehicle.highlights.map((item) => <li key={item}>{item}</li>)}</ul>}
              <p className="vehicle-about muted">Coordiná una visita con {contact.name} para verla y probarla. Respondemos por WhatsApp.</p>
            </section>
          </div>
        </div>

        {related.length > 0 && <section className="related section-space" aria-labelledby="related-title"><div className="container">
          <div className="section-heading"><div><p className="eyebrow section-eyebrow">También te puede interesar</p><h2 id="related-title" className="section-title">Vehículos similares.</h2></div></div>
          <div className="vehicle-grid">{related.map((item) => <VehicleCard key={item.id} vehicle={item} />)}</div>
          <div className="selection-footer"><p>¿Buscás otra configuración?</p><Link href="/vehiculos" className="text-link">Ver todos los vehículos <Arrow /></Link></div>
        </div></section>}
      </main>
      <Footer contact={contact} />
    </>
  );
}
