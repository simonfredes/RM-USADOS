import type { MetadataRoute } from "next";
import { getVehicles } from "./vehiculos/actions";
import { vehiclePath } from "@/lib/vehicles/vehicle";
import { absoluteUrl } from "@/lib/site";

// El stock cambia sin deploys: el sitemap se arma en cada request.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await getVehicles();
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/vehiculos"), changeFrequency: "daily", priority: 0.9 },
    ...vehicles.map((vehicle) => ({
      url: absoluteUrl(vehiclePath(vehicle)),
      ...(vehicle.updatedAt && { lastModified: new Date(vehicle.updatedAt) }),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: vehicle.images,
    })),
  ];
}
