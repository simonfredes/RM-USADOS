import type { ContactData } from "../actions";

export default function Contact({ contact }: { contact: ContactData }) {
  return (
    <section id="contacto" className="bg-[#f1efe8] px-5 py-20 text-[#11120f] sm:px-8 sm:py-28 lg:px-12">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
        <div><p className="text-xs font-bold uppercase tracking-[.22em] text-black/45">Contacto</p><h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-.045em] sm:text-5xl">Coordinemos una visita.</h2><p className="mt-6 max-w-md leading-7 text-black/55">Contanos qué vehículo estás buscando o cuál querés vender. Te respondemos para coordinar una atención personalizada.</p><div className="mt-9 space-y-4"><a href={contact.phoneHref} className="block text-xl font-semibold hover:opacity-50">{contact.phoneDisplay}</a><a href={`mailto:${contact.email}`} className="block text-lg hover:opacity-50">{contact.email}</a><p className="text-sm text-black/50">{contact.city} · Ubicación exacta a confirmar</p></div><a href={contact.whatsappHref} target="_blank" rel="noreferrer" className="mt-9 inline-flex min-h-14 items-center justify-center rounded-full bg-[#11120f] px-7 font-bold text-white transition hover:bg-[#b8ff45] hover:text-[#11120f]">Hablar por WhatsApp</a></div>
        <div className="overflow-hidden rounded-[1.75rem] bg-[#d9d8d1]"><iframe title="Zona general de atención en Salta" src="https://www.google.com/maps?q=Salta%2C%20Argentina&z=11&output=embed" className="h-[420px] w-full border-0 grayscale-[.8] sm:h-[520px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><div className="flex items-center justify-between gap-4 bg-[#11120f] px-6 py-5 text-sm text-white"><span>Salta, Argentina</span><span className="text-white/50">Zona de referencia</span></div></div>
      </div>
    </section>
  );
}
