export default function CatalogHero({ total }: { total: number }) {
  return (
    <section className="catalog-hero" aria-labelledby="catalog-hero-title"><div className="container">
      <p className="eyebrow">RM Usados</p>
      <div className="catalog-hero-content"><div><h1 id="catalog-hero-title">Nuestra colección</h1><p>Autos y SUV seleccionados. Encontrá tu próxima unidad.</p></div><p className="catalog-count">{total === 1 ? "1 unidad publicada" : `${total} unidades publicadas`}</p></div>
    </div></section>
  );
}
