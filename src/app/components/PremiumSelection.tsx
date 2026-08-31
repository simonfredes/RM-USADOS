import Image from "next/image";
import Link from "next/link";
import type { FeaturedVehicle } from "../actions";

export default function PremiumSelection({ vehicles }: { vehicles: FeaturedVehicle[] }) {
  return (
    <section id="vehiculos" className="bg-[#f1efe8] px-5 py-20 text-[#11120f] sm:px-8 sm:py-28 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div><p className="mb-4 text-xs font-bold uppercase tracking-[.22em] text-black/45">Selección destacada</p><h2 className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-.045em] sm:text-5xl lg:text-7xl">Unidades que vale la pena conocer.</h2></div>
          <p className="max-w-sm text-base leading-7 text-black/55">Una muestra de nuestro stock premium. Cada unidad se publica con información clara y asesoramiento personalizado.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <article key={vehicle.name} className="group overflow-hidden rounded-[1.75rem] bg-white shadow-[0_12px_50px_rgba(17,18,15,.07)]">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#ddd9cf]"><Image src={vehicle.image} alt={`${vehicle.name} ${vehicle.version}`} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-700 group-hover:scale-[1.035]" /><span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold backdrop-blur">Disponible</span></div>
              <div className="p-6"><div className="flex items-start justify-between gap-4"><div><h3 className="text-2xl font-semibold tracking-[-.03em]">{vehicle.name}</h3><p className="mt-1 text-sm text-black/50">{vehicle.version}</p></div><span className="text-sm font-semibold">{vehicle.year}</span></div><div className="mt-6 flex gap-5 border-t border-black/10 pt-5 text-xs text-black/55"><span>{vehicle.mileage}</span><span>{vehicle.transmission}</span></div><Link href="#contacto" className="mt-6 inline-flex items-center gap-2 text-sm font-bold">Consultar unidad <span aria-hidden="true">↗</span></Link></div>
            </article>
          ))}
        </div>
        <div className="mt-10 text-center"><Link href="#contacto" className="inline-flex min-h-14 items-center justify-center rounded-full border border-black/20 px-7 font-bold transition hover:bg-[#11120f] hover:text-white">Consultar por más unidades</Link></div>
      </div>
    </section>
  );
}
