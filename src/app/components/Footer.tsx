import Image from "next/image";
import Link from "next/link";
import type { ContactData } from "../actions";

const links = [{ label: "Inicio", href: "/" }, { label: "Vehículos", href: "/#vehiculos" }, { label: "Vendé tu auto", href: "/#contacto" }, { label: "Nosotros", href: "/#nosotros" }];

export default function Footer({ contact }: { contact: ContactData }) {
  return (
    <footer className="bg-[#f1efe8] text-[#11120f]"><div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
      <div className="grid gap-12 border-b border-black/15 pb-14 md:grid-cols-2 lg:grid-cols-[1.4fr_.7fr_.9fr] lg:gap-16">
        <div><Image src="/logos/LOGO-RM.png" alt="RM Usados seleccionados" width={1155} height={254} className="h-8 w-auto sm:h-10" /><p className="mt-6 max-w-md text-base leading-7 text-black/60">Usados elegidos con criterio. Te acompañamos de forma clara y cercana en cada paso de la compra o venta.</p></div>
        <div><h2 className="text-xs font-bold uppercase tracking-[.2em] text-black/40">Navegación</h2><div className="mt-5 flex flex-col gap-3">{links.map((link) => <Link key={link.label} href={link.href} className="w-fit transition hover:opacity-50">{link.label}</Link>)}</div></div>
        <div><h2 className="text-xs font-bold uppercase tracking-[.2em] text-black/40">Contacto</h2><div className="mt-5 space-y-3"><a href={contact.phoneHref} className="block w-fit hover:opacity-50">{contact.phoneDisplay}</a><a href={`mailto:${contact.email}`} className="block w-fit hover:opacity-50">{contact.email}</a><p className="pt-2 text-black/60">{contact.address}<br />{contact.city}</p><p className="text-sm text-black/45">{contact.hours}</p></div></div>
      </div>
      <div className="flex flex-col gap-3 pt-7 text-xs text-black/45 sm:flex-row sm:justify-between"><p>© {new Date().getFullYear()} RM Usados. Todos los derechos reservados.</p><p>Seleccionados para vos.</p></div>
    </div></footer>
  );
}
