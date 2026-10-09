export type ContactData = { phoneDisplay: string; phoneHref: string; whatsappHref: string; email: string; address: string; city: string; hours: string };
export type HeroData = { eyebrow: string; title: string; highlightedTitle: string; description: string; primaryCta: { label: string; href: string }; secondaryCta: { label: string; href: string }; highlights: string[] };
export type HomePageData = { hero: HeroData; contact: ContactData };

/** Punto único de acceso a los datos del segmento raíz. */
export async function getHomePageData(): Promise<HomePageData> {
  return {
    hero: {
      eyebrow: "RM Usados · Salta", title: "Encontrá tu", highlightedTitle: "próximo auto.",
      description: "Buscá por marca, modelo o tipo de vehículo.",
      primaryCta: { label: "Ver vehículos", href: "/vehiculos" },
      secondaryCta: { label: "Vendé tu auto", href: "#contacto" },
      highlights: ["Selección con criterio", "Atención personal", "Pasión por los detalles"],
    },
    contact: {
      phoneDisplay: "+54 9 387 000 0000", phoneHref: "tel:+5493870000000",
      whatsappHref: "https://wa.me/5493870000000?text=Hola%20RM%20Usados%2C%20quiero%20hacer%20una%20consulta.",
      email: "contacto@rmusados.com.ar", address: "Dirección a confirmar", city: "Salta, Argentina", hours: "Lunes a viernes · 9 a 18 hs",
    },
  };
}
