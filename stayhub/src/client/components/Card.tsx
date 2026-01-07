"use client";

import type { CardProps } from "@/client/types/cardProps";

export default function Card({
  title,
  subtitle,
  imageUrl,
  priceText,
  metaLeft,
  metaRight,
  badge,
  onDetailsClick,
}: CardProps) {
  return (
    <div className="group overflow-hidden rounded-[22px] border border-white/10 bg-slate-900/35 backdrop-blur transition hover:bg-slate-900/55 hover:shadow-[0_30px_90px_-60px_rgba(255,45,85,0.45)]">
      <div className="relative h-44 w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10" />

        {badge ? (
          <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs text-white/85">
            <span className="h-2 w-2 rounded-full bg-[#ff2d55]" />
            {badge}
          </div>
        ) : null}

        {priceText ? (
          <div className="absolute bottom-3 left-3 rounded-full bg-[#ff2d55] px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-[#ff2d55]/25">
            {priceText}
          </div>
        ) : null}
      </div>

      <div className="p-5">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-white">{title}</h3>
          {subtitle ? (
            <p className="mt-1 line-clamp-2 text-sm text-white/70">{subtitle}</p>
          ) : null}
        </div>

        {(metaLeft || metaRight) ? (
          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-white/60">
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white/30" />
              <span className="truncate">{metaLeft}</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#ff2d55]/80" />
              <span className="truncate">{metaRight}</span>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onDetailsClick}
          className="mt-5 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
        >
          Details
        </button>
      </div>
    </div>
  );
}
