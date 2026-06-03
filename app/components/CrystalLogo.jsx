/**
 * Logo dạng kim cương pha lê tím-hồng — dùng cạnh chữ "PDF Việt" ở Header.
 * Pure SVG, có animation pulse-glow nhẹ.
 */
export default function CrystalLogo({ size = 36 }) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      aria-hidden="true"
      className="animate-pulse-glow"
      style={{ color: "#a78bfa" }}
    >
      <defs>
        <linearGradient id="crystal-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#f9a8d4" />
          <stop offset="50%"  stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="crystal-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Thân kim cương */}
      <polygon
        points="20,3 33,15 20,37 7,15"
        fill="url(#crystal-body)"
      />
      {/* Mặt sáng */}
      <polygon
        points="20,3 26,15 20,21 14,15"
        fill="url(#crystal-highlight)"
        opacity="0.85"
      />
      {/* Đường chia mặt */}
      <line x1="20" y1="3"  x2="20" y2="37" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="0.5" />
      <line x1="7"  y1="15" x2="33" y2="15" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="0.5" />
      <line x1="14" y1="15" x2="20" y2="37" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="0.5" />
      <line x1="26" y1="15" x2="20" y2="37" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="0.5" />
    </svg>
  );
}
