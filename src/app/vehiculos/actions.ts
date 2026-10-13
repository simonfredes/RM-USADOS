import { cache } from "react";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Vehicle } from "@/lib/vehicles/vehicle";

export type { Vehicle };

const integerFormatter = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

/** Devuelve exclusivamente el stock publicado del sitio de usados. Memoizado por request. */
export const getVehicles = cache(async (): Promise<Vehicle[]> => {
  if (!hasSupabaseEnv()) {
    console.error("No se pudo consultar el catálogo: faltan las variables públicas de Supabase.");
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehiculos")
    .select("id, slug, marca, modelo, version, anio, kilometraje, combustible, transmision, carroceria, color, motor, precio, moneda, ubicacion, descripcion, actualizado_en, imagenes_vehiculo(storage_path, orden)")
    .eq("sitio", "usados")
    .eq("estado", "publicado")
    .order("creado_en", { ascending: false });

  if (error || !data) {
    console.error("No se pudo obtener el stock publicado", { code: error?.code, message: error?.message });
    return [];
  }

  return data.map((vehicle) => {
    const images = [...(vehicle.imagenes_vehiculo ?? [])]
      .sort((a, b) => a.orden - b.orden)
      .filter((image) => image.storage_path)
      .map((image) => supabase.storage.from("vehicle-images").getPublicUrl(image.storage_path).data.publicUrl);

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
      // La descripción se carga como destacados separados por "·" (p. ej. "204 CV · Única mano").
      highlights: (vehicle.descripcion ?? "").split("·").map((item: string) => item.trim()).filter(Boolean).slice(0, 6),
      updatedAt: vehicle.actualizado_en ?? null,
    };
  });
});

export const getVehicleBySlug = cache(async (slug: string) => (await getVehicles()).find((vehicle) => vehicle.slug === slug) ?? null);
