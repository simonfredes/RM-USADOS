"use client";

import { useState } from "react";

const brands = ["BMW", "Audi", "Mercedes-Benz", "Porsche", "Land Rover", "Volvo", "Lexus", "MINI", "Jaguar", "Alfa Romeo"];

/** Cinta de marcas en movimiento; la segunda copia existe solo para que el desplazamiento sea continuo. */
export default function BrandMarquee() {
  const [paused, setPaused] = useState(false);
  const list = (hidden: boolean) => <ul className="marquee-list" aria-hidden={hidden || undefined}>{brands.map((brand) => <li key={brand}>{brand}</li>)}</ul>;
  return (
    <section className={`marquee${paused ? " is-paused" : ""}`} aria-label="Marcas con las que trabajamos">
      <div className="marquee-viewport"><div className="marquee-track">{list(false)}{list(true)}</div></div>
      <button type="button" className="marquee-toggle" aria-pressed={paused} onClick={() => setPaused(!paused)} aria-label="Pausar animación de marcas">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">{paused ? <path d="M4 2.5v11l9-5.5z" /> : <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" />}</svg>
      </button>
    </section>
  );
}
