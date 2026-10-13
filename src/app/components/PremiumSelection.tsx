import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Vehicle } from "../vehiculos/actions";
import VehicleCard from "../vehiculos/components/VehicleCard";
import Arrow from "./Arrow";

const collection = [
  { name: "Elegancia en movimiento", category: "Sedanes", image: "/images/featured-sedan.png" },
  { name: "Otra perspectiva", category: "SUV", image: "/images/featured-suv.png" },
  { name: "Carácter propio", category: "Coupés", image: "/images/featured-coupe.png" },
];

export default function PremiumSelection({ vehicles }: { vehicles: Vehicle[] }) {
  const published = vehicles.length > 0;
  return (
    <section id="vehiculos" className="selection section-space" aria-labelledby="selection-title">
      <div className="container">
        <div className="section-heading reveal">
          <div><p className="eyebrow section-eyebrow">Vehículos</p><h2 id="selection-title" className="section-title">Nuestra selección.</h2></div>
          <p className="section-description">Conocé nuestras unidades y consultá por el auto que te interesa.</p>
        </div>
        <div className="selection-topline"><p>{published ? "Unidades destacadas" : "Explorá nuestra mirada"}</p><span>{published ? "Stock publicado" : "Imágenes de referencia · No representan stock disponible"}</span></div>
        <div className="vehicle-grid">
          {published ? vehicles.slice(0, 3).map((vehicle, index) => <div className="reveal" key={vehicle.id} style={{ "--reveal-index": index } as CSSProperties}><VehicleCard vehicle={vehicle} /></div>) : collection.map((item, index) => (
            <Link key={item.category} href="/vehiculos" className="editorial-card reveal" style={{ "--reveal-index": index } as CSSProperties}>
              <div className="editorial-image"><Image src={item.image} alt={`Imagen de referencia de un ${item.category.toLowerCase()} de alta gama`} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="vehicle-image" /><span className="editorial-index">0{index + 1}</span><span className="editorial-view">Explorar <Arrow diagonal /></span></div>
              <div className="editorial-copy"><p className="eyebrow">{item.category}</p><h3>{item.name}</h3><Arrow diagonal /></div>
            </Link>
          ))}
        </div>
        <div className="selection-footer reveal"><p>¿Buscás algo en particular? Hablemos.</p><Link href="/vehiculos" className="text-link">Ver todos los vehículos <Arrow /></Link></div>
      </div>
    </section>
  );
}
