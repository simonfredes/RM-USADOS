import { getImageProps } from "next/image";
import Link from "next/link";
import type { HeroData } from "../actions";
import type { Vehicle } from "../vehiculos/actions";
import { VEHICLE_BRANDS, sortBrands } from "@/lib/vehicles/brands";
import Arrow from "./Arrow";
import HeroSearch from "./HeroSearch";

export default function Hero({ content, vehicles }: { content: HeroData; vehicles: Vehicle[] }) {
  const brands = sortBrands([...new Set([...VEHICLE_BRANDS, ...vehicles.map((vehicle) => vehicle.brand)])]);
  const bodyTypes = [...new Set(["Sedán", "SUV", "Pick-up", "Coupé", ...vehicles.map((vehicle) => vehicle.bodyType).filter((type) => type !== "A consultar")])].sort((a, b) => a.localeCompare(b, "es"));
  const alt = "";
  const { props: mobileImage } = getImageProps({
    src: "/images/RM Usados-3.JPEG",
    alt,
    width: 2268,
    height: 3175,
    sizes: "100vw",
    loading: "eager",
    fetchPriority: "high",
    className: "hero-image",
  });
  const { props: desktopImage } = getImageProps({
    src: "/images/rm-usados-hero.png",
    alt,
    width: 1881,
    height: 836,
    sizes: "100vw",
  });

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-stage">
        <figure className="hero-visual">
          <picture>
            <source media="(min-width: 768px)" srcSet={desktopImage.srcSet} sizes={desktopImage.sizes} width={1881} height={836} />
            <img {...mobileImage} alt={alt} />
          </picture>
          <figcaption>Imagen de referencia</figcaption>
        </figure>
        <div className="container hero-content">
          <p className="eyebrow">{content.eyebrow}</p>
          <h1 id="hero-title" className="hero-title">{content.title} <span>{content.highlightedTitle}</span></h1>
          <p className="hero-description">{content.description}</p>
          <HeroSearch brands={brands} bodyTypes={bodyTypes} />
          <div className="hero-search-footer">
            <nav className="hero-quick-search" aria-label="Búsquedas rápidas">
              <span>Búsquedas rápidas</span>
              {["BMW", "Audi", "Mercedes-Benz"].map((brand) => <Link key={brand} href={{ pathname: "/vehiculos", query: { marca: brand } }}>{brand}</Link>)}
              <Link href="/vehiculos?carroceria=SUV">SUV</Link>
            </nav>
            <Link href={content.primaryCta.href} className="text-link hero-all-vehicles"><span>Ver todos<span className="hero-all-label"> los autos</span></span><Arrow /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
