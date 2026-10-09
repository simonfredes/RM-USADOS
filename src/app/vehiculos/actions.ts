import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type Vehicle = {
  id: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  mileage: string;
  fuel: string;
  transmission: string;
  bodyType: string;
  color: string;
  price: string;
  imageUrl: string | null;
};

const integerFormatter = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

/** Devuelve exclusivamente el stock publicado del sitio de usados. */
export async function getVehicles(): Promise<Vehicle[]> {
  if (!hasSupabaseEnv()) {
    console.error("No se pudo consultar el catálogo: faltan las variables públicas de Supabase.");
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehiculos")
    .select("id, marca, modelo, version, anio, kilometraje, combustible, transmision, carroceria, color, precio, moneda, imagenes_vehiculo(storage_path, orden)")
    .eq("sitio", "usados")
    .eq("estado", "publicado")
    .order("creado_en", { ascending: false });

  if (error || !data) {
    console.error("No se pudo obtener el stock publicado", { code: error?.code, message: error?.message });
    return [];
  }

  return data.map((vehicle) => {
    const images = [...(vehicle.imagenes_vehiculo ?? [])].sort((a, b) => a.orden - b.orden);
    const imageUrl = images[0]?.storage_path
      ? supabase.storage.from("vehicle-images").getPublicUrl(images[0].storage_path).data.publicUrl
      : null;

    return {
      id: vehicle.id,
      brand: vehicle.marca,
      model: vehicle.modelo,
      version: vehicle.version ?? "",
      year: vehicle.anio,
      mileage: vehicle.kilometraje === null ? "A consultar" : `${integerFormatter.format(vehicle.kilometraje)} km`,
      fuel: vehicle.combustible ?? "A consultar",
      transmission: vehicle.transmision ?? "A consultar",
      bodyType: vehicle.carroceria ?? "A consultar",
      color: vehicle.color ?? "A consultar",
      price: vehicle.precio !== null
        ? `${vehicle.moneda ?? "USD"} ${integerFormatter.format(Number(vehicle.precio))}`
        : "Consultar",
      imageUrl,
    };
  });
}
