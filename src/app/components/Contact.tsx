import type { ContactData } from "../actions";
import Arrow from "./Arrow";

export default function Contact({ contact, selectedVehicle }: { contact: ContactData; selectedVehicle?: string }) {
  const whatsapp = new URL(contact.whatsappHref);
  if (selectedVehicle) whatsapp.searchParams.set("text", `Hola RM Usados, quiero consultar por ${selectedVehicle}.`);
  return (
    <section id="contacto" className="contact section-space" aria-labelledby="contact-title">
      <div className="container">
        <div className="contact-intro reveal"><p className="eyebrow">Contacto</p><h2 id="contact-title" className="section-title">Hablemos de tu próximo auto.</h2><p>Contanos qué buscás o qué auto querés vender. Coordinamos una visita y te asesoramos.</p>{selectedVehicle && <p className="contact-selected">Tu consulta: {selectedVehicle}</p>}<a href={whatsapp.toString()} target="_blank" rel="noreferrer" className="button button-accent">Coordiná una visita <Arrow diagonal /></a></div>
        <div className="contact-details reveal"><div><span className="eyebrow">Teléfono y email</span><a href={contact.phoneHref}>{contact.phoneDisplay}<Arrow diagonal /></a><a href={`mailto:${contact.email}`}>{contact.email}<Arrow diagonal /></a></div><div><span className="eyebrow">Ubicación</span><p>{contact.city}</p><p className="muted">Ubicación exacta a confirmar</p><a href="https://www.google.com/maps/search/?api=1&query=Salta%2C+Argentina" target="_blank" rel="noreferrer" className="location-link">Ver zona de referencia <Arrow diagonal /></a></div><div><span className="eyebrow">Horarios</span><p>{contact.hours}</p><p className="muted">Coordiná tu visita con anticipación.</p></div></div>
      </div>
    </section>
  );
}
