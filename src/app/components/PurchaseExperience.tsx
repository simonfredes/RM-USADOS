const steps = [
  { number: "01", title: "Selección", text: "Analizamos cada unidad antes de incorporarla a nuestro stock." },
  { number: "02", title: "Información clara", text: "Te contamos el estado y los datos del vehículo de forma directa." },
  { number: "03", title: "Acompañamiento", text: "Coordinamos la visita, la documentación y cada paso de la operación." },
];

export default function PurchaseExperience() {
  return <section className="bg-[#dfe0da] px-5 py-20 text-[#11120f] sm:px-8 sm:py-28 lg:px-12"><div className="mx-auto max-w-[1440px]"><div className="grid gap-8 lg:grid-cols-2"><p className="text-xs font-bold uppercase tracking-[.22em] text-black/45">Una experiencia a la altura</p><h2 className="text-4xl font-semibold leading-[1.04] tracking-[-.045em] sm:text-5xl">Atención cercana, criterios exigentes y tiempo para decidir.</h2></div><div className="mt-14 grid border-t border-black/20 md:grid-cols-3">{steps.map((step) => <article key={step.number} className="border-b border-black/20 py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0"><span className="text-xs font-bold text-black/35">{step.number}</span><h3 className="mt-8 text-2xl font-semibold">{step.title}</h3><p className="mt-3 max-w-sm leading-7 text-black/55">{step.text}</p></article>)}</div></div></section>;
}
