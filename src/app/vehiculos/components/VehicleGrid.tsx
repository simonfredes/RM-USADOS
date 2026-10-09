"use client";

import Link from "next/link";
import { useState } from "react";
import type { Vehicle } from "../actions";
import Arrow from "../../components/Arrow";
import VehicleCard from "./VehicleCard";

export type CatalogFilters = { query: string; brand: string; bodyType: string; sort: string };
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const mileageValue = (value: string) => value === "A consultar" ? Infinity : Number(value.replace(/\D/g, ""));

export default function VehicleGrid({ vehicles, initialFilters }: { vehicles: Vehicle[]; initialFilters: CatalogFilters }) {
  const [filters, setFilters] = useState(initialFilters);
  const brands = [...new Set([...vehicles.map((vehicle) => vehicle.brand), filters.brand].filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  const bodyTypes = [...new Set([...vehicles.map((vehicle) => vehicle.bodyType).filter((type) => type !== "A consultar"), filters.bodyType].filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  const filtered = vehicles.filter((vehicle) => (!filters.brand || vehicle.brand === filters.brand) && (!filters.bodyType || normalize(vehicle.bodyType) === normalize(filters.bodyType)) && normalize(`${vehicle.brand} ${vehicle.model} ${vehicle.version}`).includes(normalize(filters.query.trim())));
  if (filters.sort === "year") filtered.sort((a, b) => b.year - a.year);
  if (filters.sort === "mileage") filtered.sort((a, b) => mileageValue(a.mileage) - mileageValue(b.mileage));
  const active = Boolean(filters.query || filters.brand || filters.bodyType || filters.sort);
  const updateFilters = (next: CatalogFilters) => {
    setFilters(next);
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries({ q: next.query, marca: next.brand, carroceria: next.bodyType, orden: next.sort })) {
      if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
    }
    window.history.replaceState(null, "", url);
  };
  const clearFilters = () => updateFilters({ query: "", brand: "", bodyType: "", sort: "" });

  return (
    <section aria-labelledby="catalog-title" className="catalog-section"><div className="container">
      <div className="catalog-toolbar"><div className="catalog-toolbar-heading"><h2 id="catalog-title">Unidades disponibles</h2><span role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}</span></div>
        {vehicles.length > 0 && <div className="catalog-filters">
          <label className="filter-control"><span>Buscá tu próximo auto</span><input type="search" name="q" value={filters.query} onChange={(event) => updateFilters({ ...filters, query: event.target.value })} placeholder="Marca, modelo o versión" autoComplete="off" /></label>
          <label className="filter-control"><span>Marca</span><select name="marca" value={filters.brand} onChange={(event) => updateFilters({ ...filters, brand: event.target.value })}><option value="">Todas las marcas</option>{brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select></label>
          <label className="filter-control"><span>Carrocería</span><select name="carroceria" value={filters.bodyType} onChange={(event) => updateFilters({ ...filters, bodyType: event.target.value })}><option value="">Todas</option>{bodyTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
          <label className="filter-control"><span>Ordenar por</span><select name="orden" value={filters.sort} onChange={(event) => updateFilters({ ...filters, sort: event.target.value })}><option value="">Últimas publicaciones</option><option value="year">Año: más nuevo</option><option value="mileage">Menor kilometraje</option></select></label>
        </div>}
      </div>
      {active && <div className="filter-summary"><p>Tu selección{filters.brand ? ` · ${filters.brand}` : ""}{filters.bodyType ? ` · ${filters.bodyType}` : ""}{filters.query ? ` · “${filters.query}”` : ""}</p><button type="button" onClick={clearFilters} className="clear-filters">Limpiar filtros</button></div>}
      {filtered.length > 0 ? <div className="vehicle-grid">{filtered.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div> : <div className="catalog-empty"><Arrow diagonal /><p className="eyebrow">{vehicles.length > 0 ? "Ampliá tu búsqueda" : "Stock en actualización"}</p><h3>{vehicles.length > 0 ? "Tu próxima elección puede estar un poco más allá." : "Las buenas elecciones merecen una conversación."}</h3><p>{vehicles.length > 0 ? "No encontramos unidades con estos filtros. Probá con otra marca o modelo." : "Estamos actualizando nuestra colección. Contanos qué buscás y consultá por los próximos ingresos."}</p>{vehicles.length > 0 ? <button type="button" className="button button-dark" onClick={clearFilters}>Ver todas las unidades <Arrow /></button> : <Link href="/#contacto" className="button button-dark">Hablemos de tu próximo auto <Arrow diagonal /></Link>}</div>}
    </div></section>
  );
}
