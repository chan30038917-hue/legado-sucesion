export function Background() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Degradado de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.18_0.05_260)] via-[oklch(0.12_0.03_260)] to-[oklch(0.08_0.01_260)]" />

      {/* Halo radial superior azul */}
      <div className="absolute -top-1/3 left-1/4 h-[80vh] w-[80vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_oklch(0.55_0.18_260_/_0.3)_0%,_transparent_60%)] blur-3xl" />

      {/* Logo Solana GRANDE y visible, centrado */}
      <svg
        className="absolute left-1/2 top-1/2 h-[85vh] w-[85vh] -translate-x-1/2 -translate-y-1/2 opacity-[0.15] blur-[0.5px]"
        viewBox="0 0 397 311"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="solana-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9945FF" />
            <stop offset="50%" stopColor="#14F195" />
            <stop offset="100%" stopColor="#9945FF" />
          </linearGradient>
        </defs>
        <path
          fill="url(#solana-grad)"
          d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"
        />
        <path
          fill="url(#solana-grad)"
          d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"
        />
        <path
          fill="url(#solana-grad)"
          d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"
        />
      </svg>

      {/* Halo dorado abajo-derecha (más sutil para no tapar el logo) */}
      <div className="absolute -bottom-1/3 -right-1/4 h-[50vh] w-[50vw] rounded-full bg-[radial-gradient(circle,_oklch(0.78_0.12_75_/_0.15)_0%,_transparent_60%)] blur-3xl" />

      {/* Estrellitas decorativas */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-[15%] top-[20%] h-1 w-1 rounded-full bg-white/60" />
        <div className="absolute left-[75%] top-[35%] h-1 w-1 rounded-full bg-white/40" />
        <div className="absolute left-[35%] top-[70%] h-1 w-1 rounded-full bg-white/50" />
        <div className="absolute left-[85%] top-[80%] h-1 w-1 rounded-full bg-white/30" />
        <div className="absolute left-[55%] top-[15%] h-1 w-1 rounded-full bg-white/40" />
        <div className="absolute left-[25%] top-[45%] h-0.5 w-0.5 rounded-full bg-white/50" />
        <div className="absolute left-[65%] top-[60%] h-0.5 w-0.5 rounded-full bg-white/40" />
      </div>

      {/* Vignette (oscurece los bordes para dar profundidad) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_oklch(0.05_0.02_260_/_0.6)_100%)]" />
    </div>
  );
}
