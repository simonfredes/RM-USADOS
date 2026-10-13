import Image from "next/image";
import Arrow from "./Arrow";

export default function BrandStory() {
  return (
    <section id="nosotros" className="brand-story section-space" aria-labelledby="story-title">
      <div className="container story-grid">
        <div className="story-photo reveal reveal-wipe"><Image src="/images/featured-coupe.png" alt="Imagen de referencia: líneas y detalles de un coupé de alta gama" fill sizes="(max-width: 767px) calc(100vw - 40px), 38vw" className="vehicle-image" /></div>
        <div className="story-copy reveal"><p className="eyebrow">Nosotros</p><h2 id="story-title" className="section-title">Autos elegidos con criterio.</h2><p className="story-description">Trabajamos con BMW, Audi, Mercedes-Benz y otras marcas de alta gama. Te acompañamos con información clara y una atención personal para que encuentres el auto que mejor se adapte a vos.</p><a href="#contacto" className="text-link">Conocenos <Arrow diagonal /></a><div className="brand-signature" aria-label="Marcas de nuestra selección"><span>BMW</span><span>Audi</span><span>Mercedes-Benz</span></div></div>
      </div>
    </section>
  );
}
