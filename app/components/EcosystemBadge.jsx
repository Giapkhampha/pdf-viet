/**
 * Badge "Một phần của hệ sinh thái GIAP KHAMPHA" — hiển thị gần title của tool.
 * Theo quy tắc bắt buộc trong docs/CONTEXT.md.
 */
export default function EcosystemBadge() {
  return (
    <a
      href="https://giapkhampha.me"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Một phần của hệ sinh thái GIAP KHAMPHA"
      className="inline-flex items-center gap-1 rounded-full border border-emerald-800 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-400 hover:bg-emerald-900/40 transition-colors duration-150"
    >
      🌱 Hệ sinh thái GIAP KHAMPHA
    </a>
  );
}
