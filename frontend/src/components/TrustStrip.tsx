export function TrustStrip() {
  const items = ["Zoom", "Google Meet", "Microsoft Teams", "PayPal", "Wise", "Bank transfer"];
  return (
    <div className="border-y border-navy/10 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-7">
        <p className="text-xs uppercase tracking-[0.18em] text-navy/45">Lessons and payments you already use</p>
        {items.map((item) => (
          <span key={item} className="font-display text-lg text-navy/50">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
