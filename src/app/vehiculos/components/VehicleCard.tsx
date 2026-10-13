import Link from "next/link";
import { vehiclePath, vehicleTitle, type Vehicle } from "@/lib/vehicles/vehicle";
import Arrow from "../../components/Arrow";
import VehicleImage from "./VehicleImage";

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const inquiry = new URLSearchParams({ unidad: `${vehicleTitle(vehicle)} (${vehicle.year})` });
  return (
    <article className="vehicle-card">
      <div className="vehicle-card-image"><VehicleImage key={vehicle.imageUrl} src={vehicle.imageUrl} alt={`${vehicleTitle(vehicle)} ${vehicle.year} usado en venta`} /><span className="vehicle-year">{vehicle.year}</span>{vehicle.images.length > 1 && <span className="vehicle-photo-count">{vehicle.images.length} fotos</span>}</div>
      <div className="vehicle-card-body"><p className="eyebrow">{vehicle.brand}</p>
        {/* El link del título se estira sobre toda la tarjeta: un único destino accesible por tarjeta. */}
        <h3 className="vehicle-name"><Link href={vehiclePath(vehicle)} className="vehicle-card-link">{vehicle.model}</Link></h3>
        <p className="vehicle-version">{vehicle.version || "Versión a consultar"}</p>
        {vehicle.highlights.length > 0 && <ul className="vehicle-highlights" aria-label="Destacados">{vehicle.highlights.slice(0, 4).map((item) => <li key={item}>{item}</li>)}</ul>}
        <dl className="vehicle-specs"><div><dt>Kilometraje</dt><dd>{vehicle.mileage}</dd></div><div><dt>Combustible</dt><dd>{vehicle.fuel}</dd></div><div><dt>Transmisión</dt><dd>{vehicle.transmission}</dd></div><div><dt>Carrocería</dt><dd>{vehicle.bodyType}</dd></div></dl>
        <div className="vehicle-card-bottom"><div><p className="vehicle-price-label">Precio de la unidad</p><p className="vehicle-price">{vehicle.price}</p><p className="vehicle-location">{vehicle.location}</p></div><Link href={`/?${inquiry.toString()}#contacto`} aria-label={`Consultar por ${vehicle.brand} ${vehicle.model}`} className="vehicle-inquiry">Consultar <Arrow diagonal /></Link></div>
      </div>
    </article>
  );
}
