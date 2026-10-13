/** Modelo de vehículo y utilidades puras: se pueden usar desde componentes de cliente. */
export type Vehicle = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  mileage: string;
  mileageValue: number | null;
  fuel: string;
  transmission: string;
  bodyType: string;
  color: string;
  engine: string | null;
  price: string;
  priceValue: number | null;
  currency: string | null;
  imageUrl: string | null;
  images: string[];
  location: string;
  highlights: string[];
  updatedAt: string | null;
};

export const vehiclePath = (vehicle: Pick<Vehicle, "slug">) => `/autos/${vehicle.slug}`;
export const vehicleTitle = (vehicle: Pick<Vehicle, "brand" | "model" | "version">) => [vehicle.brand, vehicle.model, vehicle.version].filter(Boolean).join(" ");

/**
 * Relacionados por afinidad de compra: misma carrocería y marca pesan más, luego cercanía de año,
 * precio y kilometraje. Siempre completa hasta `limit` con el resto del stock.
 */
export function getRelatedVehicles(vehicle: Vehicle, vehicles: Vehicle[], limit = 3) {
  const score = (other: Vehicle) => {
    let points = 0;
    if (other.bodyType === vehicle.bodyType && other.bodyType !== "A consultar") points += 4;
    if (other.brand === vehicle.brand) points += 3;
    if (other.model === vehicle.model) points += 2;
    points -= Math.min(Math.abs(other.year - vehicle.year), 6) * 0.4;
    if (other.priceValue !== null && vehicle.priceValue !== null && other.currency === vehicle.currency) {
      points += Math.abs(other.priceValue - vehicle.priceValue) / Math.max(vehicle.priceValue, 1) <= 0.25 ? 2 : 0;
    }
    if (other.mileageValue !== null && vehicle.mileageValue !== null) {
      points += Math.abs(other.mileageValue - vehicle.mileageValue) <= 30_000 ? 1 : 0;
    }
    return points;
  };
  return vehicles
    .filter((other) => other.id !== vehicle.id)
    .map((other, index) => ({ other, points: score(other), index }))
    .sort((a, b) => b.points - a.points || a.index - b.index)
    .slice(0, limit)
    .map(({ other }) => other);
}
