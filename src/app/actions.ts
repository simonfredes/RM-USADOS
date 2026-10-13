export type ContactData = { name: string; phoneDisplay: string; phoneHref: string; whatsappHref: string; email: string; address: string; city: string; mapsHref: string; hours: string };
export type HeroData = { eyebrow: string; title: string; highlightedTitle: string; description: string; primaryCta: { label: string; href: string }; secondaryCta: { label: string; href: string }; highlights: string[] };
export type HomePageData = { hero: HeroData; contact: ContactData };

/** Punto único de acceso a los datos del segmento raíz. */
export async function getHomePageData(): Promise<HomePageData> {
  return {
    hero: {
      eyebrow: "RM Usados · Bahía Blanca", title: "Encontrá tu", highlightedTitle: "próximo auto.",
      description: "Buscá por marca, modelo o tipo de vehículo.",
      primaryCta: { label: "Ver vehículos", href: "/vehiculos" },
      secondaryCta: { label: "Vendé tu auto", href: "#contacto" },
      highlights: ["Selección con criterio", "Atención personal", "Pasión por los detalles"],
    },
    contact: {
      name: "Nicolás", phoneDisplay: "+54 9 2914 02-8409", phoneHref: "tel:+5492914028409",
      whatsappHref: "https://wa.me/5492914028409?text=Hola%20Nicol%C3%A1s%2C%20quiero%20hacer%20una%20consulta.",
      email: "contacto@rmusados.com.ar", address: "Hipólito Yrigoyen 3877", city: "Bahía Blanca, Buenos Aires",
      mapsHref: "https://share.google/zF0QvQYmTjrZZgO", hours: "Lunes a viernes · 9 a 18 hs",
    },
  };
}
