import Slider from "@/client/components/Slider";
import Link from "next/link";

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5">
      {children}
    </div>
  );
}

export default function SellerHomePage() {
  const slides = [
    "/slides/slide1.jpg",
    "/slides/slide2.jpg",
    "/slides/slide3.jpg",
    "/slides/slide4.jpg",
    "/slides/slide5.jpg",
    "/slides/slide6.jpg",
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#ff2d55]/15 blur-[120px]" />
        <div className="absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-sky-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-16 relative">
        {/* HERO */}
        <section className="rounded-[28px] border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-[0_20px_70px_-35px_rgba(0,0,0,0.9)]">
          <div className="grid gap-10 p-7 md:grid-cols-2 md:items-center md:p-10">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                <span className="h-2 w-2 rounded-full bg-[#ff2d55]" />
                Seller workspace. Manage listings.
              </div>

              <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                Manage your properties with ease.
              </h1>

              <p className="mt-4 max-w-xl text-base text-white/70 md:text-lg">
                Create, edit and remove your listings - and keep reservations under control with quick status updates.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/seller/my-properties"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ff2d55] px-6 py-3 font-semibold text-white shadow-lg shadow-[#ff2d55]/25 hover:opacity-95"
                >
                  My properties
                </Link>

                <Link
                  href="/seller/manage-reservations"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10"
                >
                  Manage reservations
                </Link>
              </div>

              {/* Mini stats */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/60">Listing management</p>
                  <p className="mt-1 text-lg font-semibold">Create.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/60">Reservation flow</p>
                  <p className="mt-1 text-lg font-semibold">Update.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/60">Secure access</p>
                  <p className="mt-1 text-lg font-semibold">Guaranteed.</p>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="relative">
              <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-r from-[#ff2d55]/15 via-transparent to-sky-500/10 blur-2xl" />
              <div className="relative rounded-[24px] border border-white/10 bg-slate-950/25 p-4 shadow-[0_20px_60px_-40px_rgba(255,45,85,0.55)]">
                <Slider images={slides} autoPlayMs={2400} />
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="group rounded-[22px] border border-white/10 bg-slate-900/35 p-6 backdrop-blur hover:bg-slate-900/50 transition">
            <div className="flex items-start gap-4">
              <Icon>
                {/* Home/Listing icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V11z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </Icon>
              <div>
                <h2 className="text-lg font-semibold">Property control.</h2>
                <p className="mt-2 text-white/70">
                  Add new listings, update details, pricing and rooms - or remove a property when needed.
                </p>
              </div>
            </div>
          </div>

          <div className="group rounded-[22px] border border-white/10 bg-slate-900/35 p-6 backdrop-blur hover:bg-slate-900/50 transition">
            <div className="flex items-start gap-4">
              <Icon>
                {/* Calendar icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 3v3M17 3v3M4 8h16M6 6h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </Icon>
              <div>
                <h2 className="text-lg font-semibold">Reservation updates.</h2>
                <p className="mt-2 text-white/70">
                  Review bookings for your listings and set status to Pending, Confirmed or Cancelled.
                </p>
              </div>
            </div>
          </div>

          <div className="group rounded-[22px] border border-white/10 bg-slate-900/35 p-6 backdrop-blur hover:bg-slate-900/50 transition">
            <div className="flex items-start gap-4">
              <Icon>
                {/* Shield icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </Icon>
              <div>
                <h2 className="text-lg font-semibold">Guaranteed access.</h2>
                <p className="mt-2 text-white/70">
                  Seller actions are protected and available only to authenticated users.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA strip */}
        <section className="mt-10">
          <div className="rounded-[24px] border border-white/10 bg-gradient-to-r from-white/5 via-white/3 to-transparent p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold">Ready to manage your listings?</h3>
                <p className="mt-2 text-white/70">
                  Add a new property or review your current reservations in seconds.
                </p>
              </div>

              <Link
                href="/seller/my-properties"
                className="inline-flex items-center justify-center rounded-2xl bg-[#ff2d55] px-6 py-3 font-semibold text-white shadow-lg shadow-[#ff2d55]/25 hover:opacity-95"
              >
                Go to my properties
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
