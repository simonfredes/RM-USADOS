import Image from "next/image";
import Link from "next/link";
import type { ContactData } from "../actions";
import Arrow from "./Arrow";

export default function Footer({ contact }: { contact: ContactData }) {
  return (
    <footer className="site-footer"><div className="container">
      <div className="footer-main"><div><Link href="/" className="brand-logo" aria-label="RM Usados, inicio"><Image src="/logos/LOGO-RM.png" alt="RM Usados seleccionados" width={1155} height={254} className="logo-image" /></Link><p>El placer de elegir bien.</p></div><nav aria-label="Navegación del pie de página"><Link href="/vehiculos">Vehículos</Link><Link href="/#nosotros">Nosotros</Link><Link href="/#contacto">Contacto</Link></nav><a href={contact.whatsappHref} target="_blank" rel="noreferrer" className="text-link">Hablemos <Arrow diagonal /></a></div>
      <div className="footer-bottom"><p>© {new Date().getFullYear()} RM Usados. Todos los derechos reservados.</p><p>{contact.city}<span className="footer-dot">·</span>Usados seleccionados</p><a href="#contenido" className="back-to-top">Volver arriba <span aria-hidden="true">↑</span></a></div>
    </div></footer>
  );
}
