export function LuxuryBackground() {
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-[#0B0B0B]" />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 lux-noise opacity-[0.35]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(212,166,79,0.14),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(600px_400px_at_0%_50%,rgba(212,166,79,0.06),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(500px_360px_at_100%_60%,rgba(255,255,255,0.04),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px] opacity-40"
      />
    </>
  );
}
