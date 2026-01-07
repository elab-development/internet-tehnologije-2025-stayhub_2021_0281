"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { SliderProps } from "@/client/types/slider";

export default function Slider({ images, autoPlayMs = 2500 }: SliderProps) {
  const safeImages = useMemo(() => images?.filter(Boolean) ?? [], [images]);
  const [index, setIndex] = useState(0);

  const hasMany = safeImages.length > 1;

  useEffect(() => {
    if (!hasMany) return;

    const t = setInterval(() => {
      setIndex((i) => (i + 1) % safeImages.length);
    }, autoPlayMs);

    return () => clearInterval(t);
  }, [autoPlayMs, hasMany, safeImages.length]);

  if (safeImages.length === 0) {
    return (
      <div className="h-80 w-full rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
        <p className="text-white/60 text-sm">No images.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/30">
      {/* Frame (bigger) */}
      <div className="relative h-80 w-full md:h-[420px]">
        <Image
          src={safeImages[index]}
          alt={`Slide ${index + 1}`}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 640px"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/10" />
      </div>

      {/* Dots */}
      {hasMany ? (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {safeImages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={[
                "h-2.5 w-2.5 rounded-full border border-white/30 transition",
                i === index
                  ? "bg-[#ff2d55] shadow-sm shadow-[#ff2d55]/30"
                  : "bg-white/20 hover:bg-white/35",
              ].join(" ")}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
