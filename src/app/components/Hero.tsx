import Image from "next/image";
import Link from "next/link";
import type { HeroData } from "../actions";

const Arrow = () => <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4 fill-none stroke-current stroke-2"><path d="M4 10h11M11 5l5 5-5 5" /></svg>;

export default function Hero({ content }: { content: HeroData }) {
  return (
    <section className="relative isolate flex min-h-[100svh] overflow-hidden bg-[#11120f] text-white">
      <Image src="/images/rm-usados-hero.png" alt="Sedán seleccionado en un showroom contemporáneo" fill priority sizes="100vw" className="object-cover object-[64%_center] sm:object-[60%_center] lg:object-center" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,10,8,.94)_0%,rgba(9,10,8,.82)_34%,rgba(9,10,8,.2)_68%,rgba(9,10,8,.12)_100%)] max-md:bg-[linear-gradient(180deg,rgba(9,10,8,.58)_0%,rgba(9,10,8,.78)_45%,rgba(9,10,8,.96)_100%)]" />
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col justify-end px-5 pb-8 pt-32 sm:px-8 sm:pb-10 lg:justify-center lg:px-12 lg:pb-24 lg:pt-36">
        <div className="max-w-3xl">
          <p className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[.24em] text-[#b8ff45] sm:text-sm"><span className="h-px w-8 bg-current" />{content.eyebrow}</p>
          <h1 className="text-[clamp(3.25rem,8vw,7.5rem)] font-semibold leading-[.88] tracking-[-.065em]">{content.title}<span className="block font-light italic text-[#dedbd2]">{content.highlightedTitle}</span></h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">{content.description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={content.primaryCta.href} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#b8ff45] px-7 font-bold text-[#11120f] transition hover:bg-white">{content.primaryCta.label}<Arrow /></Link>
            <Link href={content.secondaryCta.href} className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/35 px-7 font-semibold transition hover:bg-white hover:text-[#11120f]">{content.secondaryCta.label}</Link>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-3 border-t border-white/20 pt-5 lg:absolute lg:bottom-8 lg:left-12 lg:right-12 lg:mt-0 lg:max-w-3xl">
          {content.highlights.map((item, i) => <div key={item} className="pr-2 sm:pr-5"><span className="mb-1 block text-[10px] font-semibold text-[#b8ff45] sm:text-xs">0{i + 1}</span><p className="text-[11px] font-medium leading-tight text-white/75 sm:text-sm">{item}</p></div>)}
        </div>
      </div>
    </section>
  );
}
