import Link from "next/link";
import type { Vehicle } from "../actions";
import Arrow from "../../components/Arrow";
import VehicleImage from "./VehicleImage";

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const inquiry = new URLSearchParams({ unidad: `${vehicle.brand} ${vehicle.model} ${vehicle.version} (${vehicle.year})`.trim() });
  return (
    <article className="vehicle-card">
      <div className="vehicle-card-image"><VehicleImage key={vehicle.imageUrl} src={vehicle.imageUrl} alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year} en venta`} /><span className="vehicle-year">{vehicle.year}</span></div>
      <div className="vehicle-card-body"><p className="eyebrow">{vehicle.brand}</p><h3 className="vehicle-name">{vehicle.model}</h3><p className="vehicle-version">{vehicle.version || "Versión a consultar"}</p>
        <dl className="vehicle-specs"><div><dt>Kilometraje</dt><dd>{vehicle.mileage}</dd></div><div><dt>Combustible</dt><dd>{vehicle.fuel}</dd></div><div><dt>Transmisión</dt><dd>{vehicle.transmission}</dd></div><div><dt>Carrocería</dt><dd>{vehicle.bodyType}</dd></div></dl>
        <div className="vehicle-card-bottom"><div><p className="vehicle-price-label">Precio de la unidad</p><p className="vehicle-price">{vehicle.price}</p><p className="vehicle-location">Salta, Argentina</p></div><Link href={`/?${inquiry.toString()}#contacto`} aria-label={`Consultar por ${vehicle.brand} ${vehicle.model}`} className="vehicle-inquiry">Consultar <Arrow diagonal /></Link></div>
      </div>
    </article>
  );
}
