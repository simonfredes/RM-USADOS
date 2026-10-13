import type { ContactData } from "../actions";
import Arrow from "./Arrow";
import { MAPS_EMBED_URL } from "@/lib/site";

export default function Contact({ contact, selectedVehicle }: { contact: ContactData; selectedVehicle?: string }) {
  const whatsapp = new URL(contact.whatsappHref);
  if (selectedVehicle) whatsapp.searchParams.set("text", `Hola ${contact.name}, quiero consultar por ${selectedVehicle}.`);
  return (
    <section id="contacto" className="contact section-space" aria-labelledby="contact-title">
      <div className="container">
        <div className="contact-intro reveal"><p className="eyebrow">Contacto</p><h2 id="contact-title" className="section-title">Hablemos de tu próximo auto.</h2><p>Contanos qué buscás o qué auto querés vender. {contact.name} te atiende personalmente, coordina la visita y te asesora.</p>{selectedVehicle && <p className="contact-selected">Tu consulta: {selectedVehicle}</p>}<a href={whatsapp.toString()} target="_blank" rel="noreferrer" className="button button-accent">Coordiná una visita <Arrow diagonal /></a></div>
        <div className="contact-details reveal"><div><span className="eyebrow">Contacto · {contact.name}</span><a href={contact.phoneHref}>{contact.phoneDisplay}<Arrow diagonal /></a><a href={`mailto:${contact.email}`}>{contact.email}<Arrow diagonal /></a></div><div><span className="eyebrow">Ubicación</span><p>{contact.address}</p><p className="muted">{contact.city}</p><a href={contact.mapsHref} target="_blank" rel="noreferrer" className="location-link">Ver ubicación en Google Maps <Arrow diagonal /></a></div><div><span className="eyebrow">Horarios</span><p>{contact.hours}</p><p className="muted">Coordiná tu visita con anticipación.</p></div></div>
        <div className="contact-map reveal"><iframe src={MAPS_EMBED_URL} title="Mapa: RM Usados en Bahía Blanca" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
      </div>
    </section>
  );
}
