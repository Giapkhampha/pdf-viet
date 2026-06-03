/**
 * Quả cầu pha lê SVG — mô phỏng "hành tinh" định dạng (PDF, WORD, EXCEL...).
 * Pure SVG + radial gradient + highlight polygon, không phụ thuộc asset PNG.
 *
 * Props:
 *   label    — text giữa cầu, vd "PDF"
 *   color    — key trong PLANET_COLORS
 *   size     — px, default 96
 *   className— bổ sung Tailwind class (vd animate-float-mid)
 */

export const PLANET_COLORS = {
  pink:    { light: "#fce7f3", mid: "#ec4899", dark: "#831843", glow: "#f472b6" },
  blue:    { light: "#dbeafe", mid: "#3b82f6", dark: "#1e3a8a", glow: "#60a5fa" },
  emerald: { light: "#d1fae5", mid: "#10b981", dark: "#064e3b", glow: "#34d399" },
  orange:  { light: "#fed7aa", mid: "#f97316", dark: "#7c2d12", glow: "#fb923c" },
  amber:   { light: "#fef3c7", mid: "#f59e0b", dark: "#78350f", glow: "#fbbf24" },
  violet:  { light: "#ede9fe", mid: "#8b5cf6", dark: "#4c1d95", glow: "#a78bfa" },
  indigo:  { light: "#e0e7ff", mid: "#6366f1", dark: "#312e81", glow: "#818cf8" },
  cyan:    { light: "#cffafe", mid: "#06b6d4", dark: "#164e63", glow: "#22d3ee" },
  teal:    { light: "#ccfbf1", mid: "#14b8a6", dark: "#134e4a", glow: "#2dd4bf" },
  red:     { light: "#fee2e2", mid: "#ef4444", dark: "#7f1d1d", glow: "#f87171" },
};

export default function PlanetIcon({
  label,
  color = "violet",
  size = 96,
  className = "",
}) {
  const c = PLANET_COLORS[color] ?? PLANET_COLORS.violet;
  // unique id per instance để gradient không clash khi có nhiều planet trên trang
  const uid = `pl-${color}-${label.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

  // Font scale theo size — label dài (PDF, MD) đều fit
  const fontSize = label.length > 4 ? size * 0.18 : label.length > 2 ? size * 0.22 : size * 0.26;

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size, color: c.glow }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="animate-pulse-glow"
        style={{ color: c.glow }}
      >
        <defs>
          <radialGradient id={`${uid}-core`} cx="35%" cy="32%" r="75%">
            <stop offset="0%"   stopColor={c.light} stopOpacity="0.95" />
            <stop offset="35%"  stopColor={c.mid}   stopOpacity="0.95" />
            <stop offset="100%" stopColor={c.dark}  stopOpacity="1"    />
          </radialGradient>
          <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
            <stop offset="40%" stopColor={c.glow} stopOpacity="0" />
            <stop offset="70%" stopColor={c.glow} stopOpacity="0.35" />
            <stop offset="100%" stopColor={c.glow} stopOpacity="0" />
          </radialGradient>
          {/* facets — đường chia kim cương */}
          <linearGradient id={`${uid}-facet`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Halo ngoài */}
        <circle cx="50" cy="50" r="48" fill={`url(#${uid}-halo)`} />

        {/* Thân cầu chính */}
        <circle cx="50" cy="50" r="34" fill={`url(#${uid}-core)`} />

        {/* Facet (kim cương) — 4 mảnh tam giác mờ */}
        <polygon points="50,16 66,38 50,50 34,38" fill={`url(#${uid}-facet)`} opacity="0.6" />
        <polygon points="84,50 66,38 50,50 66,62" fill={`url(#${uid}-facet)`} opacity="0.3" />
        <polygon points="50,84 34,62 50,50 66,62" fill={`url(#${uid}-facet)`} opacity="0.4" />
        <polygon points="16,50 34,62 50,50 34,38" fill={`url(#${uid}-facet)`} opacity="0.35" />

        {/* Highlight chính phía trên trái */}
        <ellipse cx="38" cy="34" rx="9" ry="6" fill="#ffffff" opacity="0.45" />

        {/* Label */}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight="800"
          fill="#ffffff"
          style={{ textShadow: "0 0 6px rgba(0,0,0,0.6)" }}
          letterSpacing="0.5"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
