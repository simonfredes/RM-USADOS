"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";
import VehicleImage from "../../vehiculos/components/VehicleImage";

const MAIN_SIZES = "(max-width: 1023px) calc(100vw - 40px), 60vw";

export default function VehicleGallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const thumbs = useRef<HTMLDivElement>(null);
  const total = images.length;
  const alt = (i: number) => `${title}, foto ${i + 1} de ${total}`;

  const show = (next: number) => {
    const target = (next + total) % total;
    setIndex(target);
    thumbs.current?.children[target]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") { event.preventDefault(); show(index + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); show(index - 1); }
  };

  if (total === 0) return <div className="gallery-main"><VehicleImage src={null} alt={title} /></div>;

  const controls = total > 1 && <>
    <button type="button" className="gallery-nav gallery-prev" onClick={() => show(index - 1)} aria-label="Foto anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg></button>
    <button type="button" className="gallery-nav gallery-next" onClick={() => show(index + 1)} aria-label="Foto siguiente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg></button>
  </>;

  return (
    <section className="gallery" aria-roledescription="carrusel" aria-label={`Fotos del ${title}`} onKeyDown={onKeyDown}>
      <div className="gallery-main">
        <VehicleImage key={images[index]} src={images[index]} alt={alt(index)} sizes={MAIN_SIZES} priority={index === 0} />
        <button type="button" className="gallery-expand" onClick={() => dialog.current?.showModal()} aria-label="Ver fotos en pantalla completa">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
        </button>
        {controls}
        <p className="gallery-counter" aria-live="polite">{index + 1} / {total}</p>
      </div>
      {total > 1 && <div className="gallery-thumbs" ref={thumbs}>
        {images.map((src, i) => (
          <button key={src} type="button" className="gallery-thumb" onClick={() => show(i)} aria-label={`Ver foto ${i + 1} de ${total}`} aria-current={i === index || undefined}>
            <Image src={src} alt="" fill sizes="120px" />
          </button>
        ))}
      </div>}
      <dialog ref={dialog} className="gallery-dialog" aria-label={`Fotos del ${title}`} onKeyDown={onKeyDown} onClick={(event) => { if (event.target === dialog.current) dialog.current.close(); }}>
        <div className="gallery-dialog-stage">
          <Image key={images[index]} src={images[index]} alt={alt(index)} fill sizes="100vw" className="gallery-dialog-image" />
          {controls}
          <p className="gallery-counter">{index + 1} / {total}</p>
          <button type="button" className="gallery-close" onClick={() => dialog.current?.close()} aria-label="Cerrar">×</button>
        </div>
      </dialog>
    </section>
  );
}
