/** Skeleton con la misma grilla que la ficha: el contenido real reemplaza cada bloque sin saltos. */
export default function VehicleLoading() {
  return (
    <div className="container vehicle-skeleton" role="status" aria-live="polite">
      <span className="visually-hidden">Cargando vehículo…</span>
      <div className="skeleton-breadcrumbs" aria-hidden="true"><span className="skeleton" /><span className="skeleton" /><span className="skeleton" /></div>
      <div className="vehicle-detail" aria-hidden="true">
        <div className="gallery">
          <div className="gallery-main skeleton" />
          <div className="gallery-thumbs">{Array.from({ length: 6 }, (_, i) => <span key={i} className="gallery-thumb skeleton" />)}</div>
        </div>
        <div className="vehicle-summary">
          <span className="skeleton skeleton-line" style={{ width: "28%" }} />
          <span className="skeleton skeleton-title" />
          <span className="skeleton skeleton-line" style={{ width: "40%", marginTop: 12 }} />
          <span className="skeleton skeleton-line" style={{ width: "55%", marginTop: 18 }} />
          <div className="vehicle-summary-price"><span className="skeleton skeleton-line" style={{ width: "30%" }} /><span className="skeleton skeleton-price" /></div>
          <div className="skeleton-chips">{[64, 110, 84, 104].map((width) => <span key={width} className="skeleton" style={{ width }} />)}</div>
          <div className="vehicle-actions"><span className="skeleton skeleton-button" /><span className="skeleton skeleton-button" /></div>
        </div>
      </div>
      <div className="vehicle-info" aria-hidden="true">
        <div>{Array.from({ length: 7 }, (_, i) => <div key={i} className="skeleton-row"><span className="skeleton" /><span className="skeleton" /></div>)}</div>
        <div><span className="skeleton skeleton-line" style={{ width: "90%" }} /><span className="skeleton skeleton-line" style={{ width: "75%", marginTop: 10 }} /><span className="skeleton skeleton-line" style={{ width: "60%", marginTop: 10 }} /></div>
      </div>
    </div>
  );
}
