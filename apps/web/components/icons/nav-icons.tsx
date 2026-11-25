/**
 * Menü ikonları: gravür / eski kitap baskısı havasında, fildişi yüzeyler ve
 * sepya detay çizgileri. Koyu cam menünün üstünde yumuşak durur; renkler
 * sabit, etkin olmayan satırların ikonu Sidebar'da biraz soluklaştırılır.
 */

const IVORY = "#ece2c8";
const PARCHMENT = "#d9c9a3";
const EDGE = "#b8a47a";
const SEPIA = "#5b4a32";

type IconProps = {
  className?: string;
};

const BASE = {
  viewBox: "0 0 24 24",
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

/** Kütüphane: rafta dik duran üç kitap ve yanlarına yaslanmış bir kitap. */
export function LibraryIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      {/* Kitap gövdeleri */}
      <g stroke={EDGE} strokeWidth={0.7}>
        <rect x="3.4" y="5.2" width="3.3" height="14.3" rx="0.4" fill={IVORY} />
        <rect x="6.9" y="4.2" width="3.1" height="15.3" rx="0.4" fill={PARCHMENT} />
        <rect x="10.2" y="6.4" width="2.9" height="13.1" rx="0.4" fill={IVORY} />
        <path d="M13.6 19.5l3.5-12.6 2.9.8-3.4 12.6z" fill={PARCHMENT} />
      </g>
      {/* Sırt bantları ve gravür çizgileri */}
      <g stroke={SEPIA} strokeWidth={0.45}>
        <path d="M3.4 7.1h3.3M3.4 7.9h3.3M3.4 17h3.3M3.4 17.8h3.3" />
        <path d="M6.9 6.2h3.1M6.9 7h3.1M6.9 17.1h3.1M6.9 17.9h3.1" />
        <path d="M10.2 8.3h2.9M10.2 9.1h2.9M10.2 17.2h2.9M10.2 18h2.9" />
        <path d="M16.6 8.9l2.9.8M16.4 9.7l2.9.8M14.4 16.4l2.9.8M14.2 17.2l2.9.8" />
        <path d="M5 10v5M8.45 9.5v5.6M11.65 11v4.5" strokeOpacity={0.45} />
      </g>
      {/* Raf */}
      <path d="M2.6 19.8h18.4" stroke={IVORY} strokeWidth={0.9} />
    </svg>
  );
}

/** İstatistikler: eksenleri işaretli, noktalarla yükselen bir çizgi grafik. */
export function StatsIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      {/* Eksenler */}
      <path d="M4.2 4.4v15.2h16.2" stroke={IVORY} strokeWidth={0.9} />
      <g stroke={PARCHMENT} strokeWidth={0.5}>
        <path d="M3.3 7.5h0.9M3.3 11h0.9M3.3 14.5h0.9" />
        <path d="M7.5 19.6v0.8M10.8 19.6v0.8M14.1 19.6v0.8M17.4 19.6v0.8" />
      </g>
      {/* Eğri */}
      <path
        d="M6.4 16.8l3.6-3.1 3.5-0.9 3.6-3.6 2.6-1.8"
        stroke={IVORY}
        strokeWidth={0.9}
      />
      <g fill={IVORY} stroke={SEPIA} strokeWidth={0.35}>
        <circle cx="6.4" cy="16.8" r="0.95" />
        <circle cx="10" cy="13.7" r="0.95" />
        <circle cx="13.5" cy="12.8" r="0.95" />
        <circle cx="17.1" cy="9.2" r="0.95" />
        <circle cx="19.7" cy="7.4" r="0.95" />
      </g>
    </svg>
  );
}

/** Hazinem: yıldızlı kitap ayracı. */
export function TreasuresIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path
        d="M7.2 3.4h9.6v17.2l-4.8-3.5-4.8 3.5z"
        fill={IVORY}
        stroke={EDGE}
        strokeWidth={0.7}
      />
      {/* Üst kıvrım */}
      <path d="M7.2 3.4h9.6v2.2H7.2z" fill={PARCHMENT} stroke={EDGE} strokeWidth={0.5} />
      {/* Gravür taraması ve kenar çizgileri */}
      <g stroke={SEPIA} strokeWidth={0.4} strokeOpacity={0.5}>
        <path d="M8.5 6.6v11.6M15.5 6.6v11.6" />
        <path d="M7.2 5.6h9.6" strokeOpacity={0.8} />
      </g>
      {/* Yıldız */}
      <path
        d="M12 8.6l1 2.05 2.25.33-1.63 1.59.38 2.24L12 13.75l-2 1.06.38-2.24-1.63-1.59 2.25-.33z"
        fill={SEPIA}
      />
    </svg>
  );
}
