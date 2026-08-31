"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ContactData } from "../actions";

const links = [
  { label: "Inicio", href: "/" }, { label: "Vehículos", href: "/#vehiculos" },
  { label: "Vendé tu auto", href: "/#contacto" }, { label: "Nosotros", href: "/#nosotros" },
];

export default function Navigation({ contact }: { contact: ContactData }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const solid = scrolled || open;
  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition duration-300 ${solid ? "border-black/10 bg-[#f5f3ee]/95 text-[#11120f] shadow-[0_8px_30px_rgba(0,0,0,.08)] backdrop-blur-xl" : "border-white/15 bg-black/10 text-white backdrop-blur-sm"}`}>
      <nav className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:h-20 lg:px-12" aria-label="Navegación principal">
        <Link href="/" className="relative z-10 rounded-md bg-white px-3 py-2 transition hover:scale-[1.02]" aria-label="RM Usados, inicio"><Image src="/logos/LOGO-RM.png" alt="RM Usados seleccionados" width={1155} height={254} priority className="h-6 w-auto sm:h-7" /></Link>
        <div className="hidden items-center gap-1 lg:flex">{links.map((item) => <Link key={item.label} href={item.href} className={`rounded-full px-4 py-2 text-sm font-medium transition ${solid ? "hover:bg-black/5" : "hover:bg-white/10"}`}>{item.label}</Link>)}</div>
        <div className="hidden items-center gap-3 lg:flex"><a href={contact.phoneHref} className="px-2 py-2 text-sm font-medium transition hover:opacity-60">Llamanos</a><a href={contact.whatsappHref} target="_blank" rel="noreferrer" className="rounded-full bg-[#b8ff45] px-5 py-2.5 text-sm font-bold text-[#11120f] transition hover:bg-white">WhatsApp</a></div>
        <button type="button" className="relative z-10 grid size-11 place-items-center rounded-full border border-current/20 lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open}>
          <span className="relative block h-4 w-5"><span className={`absolute left-0 top-0.5 h-px w-5 bg-current transition ${open ? "translate-y-1.5 rotate-45" : ""}`} /><span className={`absolute left-0 top-2 h-px w-5 bg-current transition ${open ? "opacity-0" : ""}`} /><span className={`absolute left-0 top-3.5 h-px w-5 bg-current transition ${open ? "-translate-y-1.5 -rotate-45" : ""}`} /></span>
        </button>
      </nav>
      <div className={`overflow-hidden transition-[max-height,opacity] duration-300 lg:hidden ${open ? "max-h-[calc(100dvh-72px)] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="flex min-h-[calc(100dvh-72px)] flex-col px-5 pb-8 pt-7 sm:px-8">{links.map((item, i) => <Link key={item.label} href={item.href} onClick={() => setOpen(false)} className="border-b border-black/10 py-4 text-2xl font-semibold tracking-tight"><span className="mr-4 text-xs text-black/40">0{i + 1}</span>{item.label}</Link>)}<a href={contact.whatsappHref} target="_blank" rel="noreferrer" className="mt-auto rounded-full bg-[#11120f] px-6 py-4 text-center font-bold text-white">Escribinos por WhatsApp</a></div>
      </div>
    </header>
  );
}
