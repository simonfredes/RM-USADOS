/** URL pública del sitio; en producción NEXT_PUBLIC_SITE_URL debe apuntar al dominio real. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const absoluteUrl = (path: string) => new URL(path, `${SITE_URL}/`).toString();

/** Escapa "<" para que el JSON-LD no pueda cerrar el <script> que lo contiene. */
export const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });

/** Coordenadas de la ficha de Google Maps de RM USADOS. */
export const BUSINESS_GEO = { latitude: -38.687996, longitude: -62.2301255 };
export const MAPS_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3114.298111532184!2d-62.2301255!3d-38.687996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95eda500793e4735%3A0x90561dceb1bd73e7!2sRM%20USADOS!5e0!3m2!1ses!2sar!4v1791899892292!5m2!1ses!2sar";
