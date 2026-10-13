"use client";

import Link from "next/link";
import { useState } from "react";
import type { Vehicle } from "../actions";
import Arrow from "../../components/Arrow";
import VehicleCard from "./VehicleCard";
import { sortBrands } from "@/lib/vehicles/brands";
import { BUDGET_RANGES, EMPTY_FILTERS, FILTER_PARAMS, MILEAGE_LIMITS, SORT_OPTIONS, distinctValues, filterVehicles, type CatalogFilters } from "@/lib/vehicles/filters";

const ADVANCED: (keyof CatalogFilters)[] = ["yearFrom", "yearTo", "mileage", "fuel", "transmission"];

/** Etiqueta legible de cada filtro activo, para los chips removibles. */
function describe(key: keyof CatalogFilters, value: string) {
  switch (key) {
    case "query": return `“${value}”`;
    case "budget": return `${BUDGET_RANGES.find((range) => range.value === value)?.label ?? value} USD`;
    case "mileage": return MILEAGE_LIMITS.find((limit) => limit.value === value)?.label ?? value;
    case "yearFrom": return `Desde ${value}`;
    case "yearTo": return `Hasta ${value}`;
    default: return value;
  }
}

export default function VehicleGrid({ vehicles, initialFilters }: { vehicles: Vehicle[]; initialFilters: CatalogFilters }) {
  const [filters, setFilters] = useState(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(() => ADVANCED.some((key) => initialFilters[key]));
  const withCurrent = (values: string[], current: string) => distinctValues([...values, current]);
  const brands = sortBrands(withCurrent(vehicles.map((vehicle) => vehicle.brand), filters.brand));
  const models = withCurrent(vehicles.filter((vehicle) => !filters.brand || vehicle.brand === filters.brand).map((vehicle) => vehicle.model), filters.model);
  const bodyTypes = withCurrent(vehicles.map((vehicle) => vehicle.bodyType), filters.bodyType);
  const fuels = withCurrent(vehicles.map((vehicle) => vehicle.fuel), filters.fuel);
  const transmissions = withCurrent(vehicles.map((vehicle) => vehicle.transmission), filters.transmission);
  const years = [...new Set([...vehicles.map((vehicle) => vehicle.year), ...[filters.yearFrom, filters.yearTo].filter(Boolean).map(Number)])].sort((a, b) => b - a);
  const filtered = filterVehicles(vehicles, filters);
  const activeEntries = (Object.keys(FILTER_PARAMS) as (keyof CatalogFilters)[]).filter((key) => key !== "sort" && filters[key]);
  const advancedCount = ADVANCED.filter((key) => filters[key]).length;
  const active = activeEntries.length > 0 || Boolean(filters.sort);

  const updateFilters = (next: CatalogFilters) => {
    setFilters(next);
    const url = new URL(window.location.href);
    for (const key of Object.keys(FILTER_PARAMS) as (keyof CatalogFilters)[]) {
      if (next[key]) url.searchParams.set(FILTER_PARAMS[key], next[key]); else url.searchParams.delete(FILTER_PARAMS[key]);
    }
    window.history.replaceState(null, "", url);
  };
  const set = (key: keyof CatalogFilters) => (event: { target: { value: string } }) => {
    const next = { ...filters, [key]: event.target.value };
    // Un modelo de otra marca nunca puede coincidir: se descarta al cambiar de marca.
    if (key === "brand" && next.model && !vehicles.some((vehicle) => vehicle.brand === next.brand && vehicle.model === next.model)) next.model = "";
    updateFilters(next);
  };
  const clearFilters = () => updateFilters(EMPTY_FILTERS);
  const select = (key: keyof CatalogFilters, label: string, placeholder: string, options: { value: string; label: string }[]) => (
    <label className="filter-control"><span>{label}</span><select name={FILTER_PARAMS[key]} value={filters[key]} onChange={set(key)}><option value="">{placeholder}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
  );
  const plain = (values: (string | number)[]) => values.map((value) => ({ value: String(value), label: String(value) }));

  return (
    <section aria-labelledby="catalog-title" className="catalog-section"><div className="container">
      <div className="catalog-toolbar"><div className="catalog-toolbar-heading"><h2 id="catalog-title">Unidades disponibles</h2><span role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}</span></div>
        {vehicles.length > 0 && <>
          <div className="catalog-filters">
            <label className="filter-control filter-query"><span>Buscá tu próximo auto</span><input type="search" name="q" value={filters.query} onChange={set("query")} placeholder="Marca, modelo o versión" autoComplete="off" /></label>
            {select("brand", "Marca", "Todas", plain(brands))}
            {select("model", "Modelo", "Todos", plain(models))}
            {select("budget", "Presupuesto (USD)", "Cualquiera", [...BUDGET_RANGES])}
            {select("bodyType", "Carrocería", "Todas", plain(bodyTypes))}
          </div>
          <div className="catalog-filter-bar">
            <button type="button" className="more-filters" aria-expanded={showAdvanced} aria-controls="catalog-advanced-filters" onClick={() => setShowAdvanced(!showAdvanced)}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 6h9M15 6h2M3 14h2M8 14h9" /><circle cx="13.5" cy="6" r="1.5" /><circle cx="6.5" cy="14" r="1.5" /></svg>
              Más filtros{advancedCount > 0 && <span className="more-filters-count">{advancedCount}</span>}
            </button>
            <label className="filter-control filter-sort"><span>Ordenar por</span><select name="orden" value={filters.sort} onChange={set("sort")}>{SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          </div>
          <div id="catalog-advanced-filters" className="catalog-advanced" hidden={!showAdvanced}>
            {select("yearFrom", "Año desde", "Cualquiera", plain([...years].reverse()))}
            {select("yearTo", "Año hasta", "Cualquiera", plain(years))}
            {select("mileage", "Kilometraje", "Cualquiera", [...MILEAGE_LIMITS])}
            {select("fuel", "Combustible", "Todos", plain(fuels))}
            {select("transmission", "Transmisión", "Todas", plain(transmissions))}
          </div>
        </>}
      </div>
      {active && <div className="filter-summary">
        <ul className="filter-chips" aria-label="Filtros activos">{activeEntries.map((key) => <li key={key}><button type="button" className="filter-chip" onClick={() => updateFilters({ ...filters, [key]: "" })} aria-label={`Quitar filtro ${describe(key, filters[key])}`}>{describe(key, filters[key])}<span aria-hidden="true">×</span></button></li>)}</ul>
        <button type="button" onClick={clearFilters} className="clear-filters">Limpiar filtros</button>
      </div>}
      {filtered.length > 0 ? <div className="vehicle-grid">{filtered.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div> : <div className="catalog-empty"><Arrow diagonal /><p className="eyebrow">{vehicles.length > 0 ? "Ampliá tu búsqueda" : "Stock en actualización"}</p><h3>{vehicles.length > 0 ? "Tu próxima elección puede estar un poco más allá." : "Las buenas elecciones merecen una conversación."}</h3><p>{vehicles.length > 0 ? "No encontramos unidades con estos filtros. Probá ampliando el presupuesto o con otra marca." : "Estamos actualizando nuestra colección. Contanos qué buscás y consultá por los próximos ingresos."}</p>{vehicles.length > 0 ? <button type="button" className="button button-dark" onClick={clearFilters}>Ver todas las unidades <Arrow /></button> : <Link href="/#contacto" className="button button-dark">Hablemos de tu próximo auto <Arrow diagonal /></Link>}</div>}
    </div></section>
  );
}
