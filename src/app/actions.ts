export type ContactData = { phoneDisplay: string; phoneHref: string; whatsappHref: string; email: string; address: string; city: string; hours: string };
export type HeroData = { eyebrow: string; title: string; highlightedTitle: string; description: string; primaryCta: { label: string; href: string }; secondaryCta: { label: string; href: string }; highlights: string[] };
export type HomePageData = { hero: HeroData; contact: ContactData };
export type FeaturedVehicle = { name: string; version: string; year: number; mileage: string; transmission: string; image: string };

/** Punto único de acceso a los datos del segmento raíz. */
export async function getHomePageData(): Promise<HomePageData & { vehicles: FeaturedVehicle[] }> {
  return {
    hero: {
      eyebrow: "Usados seleccionados", title: "Tu próximo auto,", highlightedTitle: "bien elegido.",
      description: "Vehículos revisados, atención personalizada y el respaldo que necesitás para decidir con tranquilidad.",
      primaryCta: { label: "Ver vehículos", href: "/#vehiculos" },
      secondaryCta: { label: "Quiero vender mi auto", href: "#contacto" },
      highlights: ["Selección cuidada", "Asesoramiento real", "Gestión simple"],
    },
    contact: {
      phoneDisplay: "+54 9 387 000 0000", phoneHref: "tel:+5493870000000",
      whatsappHref: "https://wa.me/5493870000000?text=Hola%20RM%20Usados%2C%20quiero%20hacer%20una%20consulta.",
      email: "contacto@rmusados.com.ar", address: "Dirección a confirmar", city: "Salta, Argentina", hours: "Lunes a viernes · 9 a 18 hs",
    },
    vehicles: [
      { name: "Audi A6", version: "45 TFSI quattro", year: 2023, mileage: "18.500 km", transmission: "Automática", image: "/images/featured-sedan.png" },
      { name: "Mercedes-Benz GLE", version: "450 4MATIC", year: 2022, mileage: "27.000 km", transmission: "Automática", image: "/images/featured-suv.png" },
      { name: "BMW Serie 8", version: "M850i xDrive", year: 2021, mileage: "31.200 km", transmission: "Automática", image: "/images/featured-coupe.png" },
    ],
  };
}
