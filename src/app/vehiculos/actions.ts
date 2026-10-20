import { cache } from "react";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Vehicle } from "@/lib/vehicles/vehicle";

export type { Vehicle };

const integerFormatter = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

/** Fila de `catalogo_usados_publico()`: solo columnas públicas, sin dominio ni datos internos. */
type CatalogRow = {
  id: string;
  slug: string | null;
  marca: string;
  modelo: string;
  version: string | null;
  anio: number;
  kilometraje: number | null;
  combustible: string | null;
  transmision: string | null;
  carroceria: string | null;
  color: string | null;
  motor: string | null;
  precio: number | string | null;
  moneda: string | null;
  ubicacion: string | null;
  descripcion: string | null;
  actualizado_en: string | null;
  imagenes: string[] | null;
};

/**
 * Devuelve exclusivamente el stock publicado del sitio de usados. Memoizado por request.
 * La base no permite leer `vehiculos` con la clave pública: la función SQL filtra los usados
 * publicados, los ordena del más reciente al más antiguo y entrega sus imágenes en orden.
 */
export const getVehicles = cache(async (): Promise<Vehicle[]> => {
  if (!hasSupabaseEnv()) {
    console.error("No se pudo consultar el catálogo: faltan las variables públicas de Supabase.");
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("catalogo_usados_publico");

  if (error || !Array.isArray(data)) {
    console.error("No se pudo obtener el stock publicado", { code: error?.code, message: error?.message });
    return [];
  }

  return (data as CatalogRow[]).map((vehicle) => {
    const images = (vehicle.imagenes ?? [])
      .filter(Boolean)
      .map((path) => supabase.storage.from("vehicle-images").getPublicUrl(path).data.publicUrl);

    return {
      id: vehicle.id,
      // Las unidades sin slug siguen siendo accesibles por su id.
      slug: vehicle.slug || vehicle.id,
      brand: vehicle.marca,
      model: vehicle.modelo,
      version: vehicle.version ?? "",
      year: vehicle.anio,
      mileage: vehicle.kilometraje === null ? "A consultar" : `${integerFormatter.format(vehicle.kilometraje)} km`,
      mileageValue: vehicle.kilometraje,
      fuel: vehicle.combustible ?? "A consultar",
      transmission: vehicle.transmision ?? "A consultar",
      bodyType: vehicle.carroceria ?? "A consultar",
      color: vehicle.color ?? "A consultar",
      engine: vehicle.motor ?? null,
      price: vehicle.precio !== null
        ? `${vehicle.moneda ?? "USD"} ${integerFormatter.format(Number(vehicle.precio))}`
        : "Consultar",
      priceValue: vehicle.precio === null ? null : Number(vehicle.precio),
      currency: vehicle.precio === null ? null : vehicle.moneda ?? "USD",
      imageUrl: images[0] ?? null,
      images,
      location: vehicle.ubicacion ?? "Bahía Blanca, Buenos Aires",
      // Destacados separados por "·" ("204 CV · Única mano") o uno por renglón, como se cargan en el panel.
      highlights: (vehicle.descripcion ?? "").split(/[·\r\n]+/).map((item) => item.trim()).filter(Boolean).slice(0, 6),
      updatedAt: vehicle.actualizado_en ?? null,
    };
  });
});

export const getVehicleBySlug = cache(async (slug: string) => (await getVehicles()).find((vehicle) => vehicle.slug === slug) ?? null);
