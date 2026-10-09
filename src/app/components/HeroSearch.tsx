"use client";

import Form from "next/form";
import { useState } from "react";
import Arrow from "./Arrow";
import styles from "./HeroSearch.module.css";

export default function HeroSearch({ brands, bodyTypes }: { brands: string[]; bodyTypes: string[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Form action="/vehiculos" className="hero-search" role="search" aria-label="Buscar vehículos">
      <label className="hero-filter hero-query"><span>¿Qué auto buscás?</span><input type="search" name="q" placeholder="Marca, modelo o versión" autoComplete="off" /></label>
      <button type="button" className={styles.toggle} aria-expanded={expanded} aria-controls="hero-search-options" onClick={() => setExpanded(!expanded)}>
        <span>Marca y carrocería</span>
        <svg width="18" height="18" className={styles.chevron} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m5 7 5 5 5-5" /></svg>
      </button>
      <div id="hero-search-options" className={`${styles.options}${expanded ? ` ${styles.expanded}` : ""}`}>
        <label className="hero-filter"><span>Marca</span><select name="marca" defaultValue=""><option value="">Todas</option>{brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select></label>
        <label className="hero-filter"><span>Carrocería</span><select name="carroceria" defaultValue=""><option value="">Todas</option>{bodyTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
      </div>
      <button type="submit" className="button button-accent hero-search-button">Buscar autos<Arrow /></button>
    </Form>
  );
}
