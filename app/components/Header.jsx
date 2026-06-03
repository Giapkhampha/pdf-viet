import Link from "next/link";
import CrystalLogo from "@/app/components/CrystalLogo";

/**
 * Header chung toàn app — dark theme cosmic.
 * Logo pha lê + "PDF Việt" + nav + CTA hệ sinh thái.
 *
 * Lưu ý có chủ đích bỏ:
 *   - Nút "Bảng giá": app miễn phí 100% (CLAUDE.md), không có pricing.
 *   - Nút "Đăng nhập": không có auth, không backend (cam kết privacy).
 *   - Dropdown ngôn ngữ: đa ngôn ngữ là Phase 5 ROADMAP, chưa tới.
 */
function NavLink({ href, children, external = false }) {
  const cls =
    "px-3 py-2 text-sm text-neutral-300 hover:text-emerald-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 rounded-md";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-800/80 bg-neutral-950/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 rounded-lg"
          aria-label="PDF Việt — về trang chủ"
        >
          <CrystalLogo size={32} />
          <span className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-violet-300 via-pink-300 to-amber-300 bg-clip-text text-transparent">
            PDF Việt
          </span>
        </Link>

        {/* Nav giữa */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden md:flex items-center gap-1"
        >
          <NavLink href="/">Trang chủ</NavLink>
          <NavLink href="/#cong-cu">Công cụ</NavLink>
          <NavLink href="https://giapkhampha.me/#bai-viet" external>
            Bài viết
          </NavLink>
          <NavLink href="https://giapkhampha.me/#ve-toi" external>
            Về Ba Maya
          </NavLink>
        </nav>

        {/* CTA hệ sinh thái */}
        <a
          href="https://giapkhampha.me"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Khám phá hệ sinh thái GIAP KHAMPHA"
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-amber-500/10 hover:from-emerald-500/20 hover:to-amber-500/20 px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
        >
          <span className="text-emerald-400 font-black">GIAP</span>
          <span className="text-amber-400 font-black">KHAMPHA</span>
          <span className="text-neutral-500 ml-0.5 hidden sm:inline">→</span>
        </a>
      </div>
    </header>
  );
}
