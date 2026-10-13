import type { Vehicle } from "@/app/vehiculos/actions";

/** Rangos de presupuesto en USD (las etiquetas omiten la moneda para entrar en selects angostos); las unidades con precio en otra moneda o "Consultar" quedan fuera al filtrar. */
export const BUDGET_RANGES = [
  { value: "0-25000", label: "Hasta 25 mil", min: 0, max: 25_000 },
  { value: "25000-50000", label: "25 a 50 mil", min: 25_000, max: 50_000 },
  { value: "50000-80000", label: "50 a 80 mil", min: 50_000, max: 80_000 },
  { value: "80000-120000", label: "80 a 120 mil", min: 80_000, max: 120_000 },
  { value: "120000-", label: "Más de 120 mil", min: 120_000, max: Infinity },
] as const;

export const MILEAGE_LIMITS = [
  { value: "20000", label: "Hasta 20.000 km" },
  { value: "50000", label: "Hasta 50.000 km" },
  { value: "100000", label: "Hasta 100.000 km" },
  { value: "150000", label: "Hasta 150.000 km" },
] as const;

export const SORT_OPTIONS = [
  { value: "", label: "Últimas publicaciones" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "year", label: "Año: más nuevo" },
  { value: "mileage", label: "Menor kilometraje" },
] as const;

export type CatalogFilters = {
  query: string;
  brand: string;
  model: string;
  bodyType: string;
  budget: string;
  yearFrom: string;
  yearTo: string;
  mileage: string;
  fuel: string;
  transmission: string;
  sort: string;
};

/** Nombre del parámetro de URL para cada filtro; compartido por el hero y el catálogo. */
export const FILTER_PARAMS: Record<keyof CatalogFilters, string> = {
  query: "q", brand: "marca", model: "modelo", bodyType: "carroceria", budget: "presupuesto",
  yearFrom: "anio_desde", yearTo: "anio_hasta", mileage: "km", fuel: "combustible", transmission: "transmision", sort: "orden",
};

export const EMPTY_FILTERS: CatalogFilters = {
  query: "", brand: "", model: "", bodyType: "", budget: "", yearFrom: "", yearTo: "", mileage: "", fuel: "", transmission: "", sort: "",
};

export function parseFilters(read: (param: string) => string): CatalogFilters {
  const filters = { ...EMPTY_FILTERS };
  for (const key of Object.keys(FILTER_PARAMS) as (keyof CatalogFilters)[]) filters[key] = read(FILTER_PARAMS[key]).slice(0, 120);
  if (!SORT_OPTIONS.some((option) => option.value === filters.sort)) filters.sort = "";
  if (!BUDGET_RANGES.some((range) => range.value === filters.budget)) filters.budget = "";
  if (!MILEAGE_LIMITS.some((limit) => limit.value === filters.mileage)) filters.mileage = "";
  if (!/^\d{4}$/.test(filters.yearFrom)) filters.yearFrom = "";
  if (!/^\d{4}$/.test(filters.yearTo)) filters.yearTo = "";
  return filters;
}

export const normalizeText = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const same = (a: string, b: string) => normalizeText(a) === normalizeText(b);

export function filterVehicles(vehicles: Vehicle[], filters: CatalogFilters) {
  const budget = BUDGET_RANGES.find((range) => range.value === filters.budget);
  const query = normalizeText(filters.query.trim());
  const result = vehicles.filter((vehicle) =>
    (!filters.brand || vehicle.brand === filters.brand)
    && (!filters.model || same(vehicle.model, filters.model))
    && (!filters.bodyType || same(vehicle.bodyType, filters.bodyType))
    && (!filters.fuel || same(vehicle.fuel, filters.fuel))
    && (!filters.transmission || same(vehicle.transmission, filters.transmission))
    && (!filters.yearFrom || vehicle.year >= Number(filters.yearFrom))
    && (!filters.yearTo || vehicle.year <= Number(filters.yearTo))
    && (!filters.mileage || (vehicle.mileageValue !== null && vehicle.mileageValue <= Number(filters.mileage)))
    && (!budget || (vehicle.currency === "USD" && vehicle.priceValue !== null && vehicle.priceValue >= budget.min && vehicle.priceValue <= budget.max))
    && normalizeText(`${vehicle.brand} ${vehicle.model} ${vehicle.version}`).includes(query));

  const priceOrInfinity = (vehicle: Vehicle) => vehicle.priceValue ?? Infinity;
  if (filters.sort === "price-asc") result.sort((a, b) => priceOrInfinity(a) - priceOrInfinity(b));
  if (filters.sort === "price-desc") result.sort((a, b) => (b.priceValue ?? -Infinity) - (a.priceValue ?? -Infinity));
  if (filters.sort === "year") result.sort((a, b) => b.year - a.year);
  if (filters.sort === "mileage") result.sort((a, b) => (a.mileageValue ?? Infinity) - (b.mileageValue ?? Infinity));
  return result;
}

/** Valores distintos y ordenados, sin "A consultar". */
export function distinctValues(values: string[]) {
  return [...new Set(values.filter((value) => value && value !== "A consultar"))].sort((a, b) => a.localeCompare(b, "es"));
}
