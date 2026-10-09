"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Progressive enhancement: content stays visible without JavaScript or motion. */
export default function VisualEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cleanup = () => {};
    const setup = () => {
      cleanup();
      if (preference.matches) return;

      const elements = [...document.querySelectorAll<HTMLElement>(".reveal")];
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("reveal-pending");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });

      elements.forEach((element) => {
        if (element.getBoundingClientRect().top > window.innerHeight) element.classList.add("reveal-pending");
        observer.observe(element);
      });

      let frame = 0;
      const update = () => {
        const height = document.documentElement.scrollHeight - window.innerHeight;
        document.documentElement.style.setProperty("--scroll-progress", `${height > 0 ? window.scrollY / height : 0}`);
        frame = 0;
      };
      const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      cleanup = () => {
        observer.disconnect();
        elements.forEach((element) => element.classList.remove("reveal-pending"));
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        window.cancelAnimationFrame(frame);
        document.documentElement.style.removeProperty("--scroll-progress");
      };
    };
    setup();
    preference.addEventListener("change", setup);
    return () => { cleanup(); preference.removeEventListener("change", setup); };
  }, [pathname]);

  return null;
}
