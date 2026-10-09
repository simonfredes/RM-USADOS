"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { ContactData } from "../actions";
import Arrow from "./Arrow";

const links = [
  { label: "Inicio", href: "/" },
  { label: "Vehículos", href: "/vehiculos" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Vendé tu auto", href: "/#contacto" },
];

export default function Navigation({ contact }: { contact: ContactData }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const previousOverflow = useRef("");

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 32);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!open) return;
    const media = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (media.matches) dialog.current?.close(); };
    media.addEventListener("change", closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow.current;
      media.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);

  const openMenu = () => {
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
    setOpen(true);
  };
  const closeMenu = () => {
    document.body.style.overflow = previousOverflow.current;
    dialog.current?.close();
    setOpen(false);
  };
  return (
    <>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <nav className="container navigation" aria-label="Navegación principal">
          <Link href="/" className="brand-logo" aria-label="RM Usados, inicio">
            <Image src="/logos/LOGO-RM.png" alt="RM Usados seleccionados" width={1155} height={254} loading="eager" className="logo-image" />
          </Link>
          <div className="desktop-links">{links.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} className="nav-link">{item.label}</Link>
          ))}</div>
          <a href={contact.whatsappHref} target="_blank" rel="noreferrer" className="header-contact">Hablemos <Arrow diagonal /></a>
          <button ref={trigger} type="button" className="menu-toggle" onClick={openMenu} aria-label="Abrir menú" aria-expanded={open} aria-controls="mobile-menu">
            <span /><span />
          </button>
        </nav>
        <div className="reading-progress" aria-hidden="true" />
      </header>
      <dialog ref={dialog} id="mobile-menu" className="mobile-menu" aria-labelledby="menu-title" onCancel={() => { document.body.style.overflow = previousOverflow.current; setOpen(false); }} onClose={() => { document.body.style.overflow = previousOverflow.current; setOpen(false); trigger.current?.focus(); }} onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const targets = [...event.currentTarget.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];
        const current = targets.indexOf(document.activeElement as HTMLElement);
        const next = (current + (event.shiftKey ? -1 : 1) + targets.length) % targets.length;
        event.preventDefault();
        targets[next]?.focus();
      }}>
        <div className="mobile-menu-top">
          <span id="menu-title" className="eyebrow">RM Usados · Menú</span>
          <button type="button" onClick={closeMenu} className="menu-close" aria-label="Cerrar menú" autoFocus>×</button>
        </div>
        <nav aria-label="Navegación móvil" className="mobile-links">{links.map((item, index) => (
          <Link key={item.href} href={item.href} onClick={closeMenu}><span className="menu-index">0{index + 1}</span><span>{item.label}</span><Arrow diagonal /></Link>
        ))}</nav>
        <div className="mobile-menu-bottom"><p className="eyebrow">Tu próxima elección empieza acá.</p><a href={contact.whatsappHref} target="_blank" rel="noreferrer" className="button button-accent" onClick={closeMenu}>Hablar por WhatsApp <Arrow diagonal /></a><p className="muted">{contact.city}</p></div>
      </dialog>
    </>
  );
}
