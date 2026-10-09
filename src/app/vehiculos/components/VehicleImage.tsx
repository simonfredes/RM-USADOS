"use client";

import Image from "next/image";
import { useState } from "react";

export default function VehicleImage({ src, alt }: { src: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className="vehicle-placeholder" role="img" aria-label={`${alt}. Imagen no disponible`}><div><svg viewBox="0 0 120 50" fill="none" strokeWidth="1.2" aria-hidden="true"><path d="m9 33 6-15 18-3 13-9h35l18 13 12 6v13h-13m-62 0H22m25 0h37M35 15h53M55 7l-4 8M76 7l7 8" /><circle cx="35" cy="36" r="8" /><circle cx="92" cy="36" r="8" /></svg><p>Fotografía próximamente</p></div></div>;
  }
  return <Image src={src} alt={alt} fill sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) 50vw, 33vw" className="vehicle-image" onError={() => setFailed(true)} />;
}
