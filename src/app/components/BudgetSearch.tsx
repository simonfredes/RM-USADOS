import type { CSSProperties } from "react";
import Link from "next/link";
import type { Vehicle } from "../vehiculos/actions";
import { BUDGET_RANGES, filterVehicles, EMPTY_FILTERS } from "@/lib/vehicles/filters";
import Arrow from "./Arrow";

export default function BudgetSearch({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <section className="budget section-space" aria-labelledby="budget-title"><div className="container">
      <div className="section-heading reveal">
        <div><p className="eyebrow section-eyebrow">Presupuesto</p><h2 id="budget-title" className="section-title">Buscá según tu presupuesto.</h2></div>
        <p className="section-description">Elegí un rango y te mostramos las unidades que encajan. Precios de referencia en dólares.</p>
      </div>
      <ul className="budget-grid">
        {BUDGET_RANGES.map((range, index) => {
          const count = vehicles.length > 0 ? filterVehicles(vehicles, { ...EMPTY_FILTERS, budget: range.value }).length : null;
          return (
            <li key={range.value} className="reveal" style={{ "--reveal-index": index } as CSSProperties}>
              <Link href={{ pathname: "/vehiculos", query: { presupuesto: range.value } }} className="budget-tile">
                <span className="budget-index">USD</span>
                <span className="budget-label">{range.label}</span>
                <span className="budget-meta">{count === null ? "Ver unidades" : count === 0 ? "Próximos ingresos" : count === 1 ? "1 unidad" : `${count} unidades`}<Arrow diagonal /></span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div></section>
  );
}
