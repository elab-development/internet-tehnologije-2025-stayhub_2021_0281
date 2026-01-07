//Footer komponenta
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-slate-950/60 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-white/60">
        © {year} StayHub. All rights reserved.
      </div>
    </footer>
  );
}
