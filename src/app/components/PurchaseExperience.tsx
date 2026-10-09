import Arrow from "./Arrow";

const steps = [
  { number: "01", title: "Elegí tu auto", text: "Explorá las unidades y contanos qué estás buscando. Te ayudamos a conocer las opciones." },
  { number: "02", title: "Conocé cada detalle", text: "Coordinamos una visita y te damos la información que necesitás para decidir." },
  { number: "03", title: "Te acompañamos", text: "Estamos con vos durante la documentación y cada paso de la operación." },
];

export default function PurchaseExperience() {
  return (
    <section className="experience section-space" aria-labelledby="experience-title"><div className="container">
      <div className="section-heading reveal"><div><p className="eyebrow section-eyebrow">Cómo trabajamos</p><h2 id="experience-title" className="section-title">Una compra simple, de principio a fin.</h2></div></div>
      <div className="experience-steps">{steps.map((step) => <article key={step.number} className="experience-step reveal"><div className="step-top"><span>{step.number}</span><Arrow diagonal /></div><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
    </div></section>
  );
}
