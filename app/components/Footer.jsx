import Link from "next/link";

// External links always open in new tab with noopener
function ExternalLink({ href, children, className }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

// Column heading style shared across link columns
function ColHeading({ children }) {
  return (
    <h3 className="text-neutral-100 font-semibold uppercase tracking-wider text-xs mb-4">
      {children}
    </h3>
  );
}

// Reusable external nav link with hover effect
function NavLink({ href, children }) {
  return (
    <li>
      <ExternalLink
        href={href}
        className="text-neutral-400 hover:text-emerald-400 transition-colors duration-200 text-sm"
      >
        {children}
      </ExternalLink>
    </li>
  );
}

export default function Footer() {
  return (
    <footer
      className="bg-neutral-950 border-t border-neutral-800 mt-auto"
      aria-label="Footer hệ sinh thái GIAP KHAMPHA"
    >
      <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8 lg:py-16">

        {/* Main grid: logo col + 3 link cols */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

          {/* a. Logo & tagline — chiếm 2/5 ở desktop */}
          <div className="lg:col-span-2">
            {/* Logo text 2 màu */}
            <ExternalLink
              href="https://giapkhampha.me"
              className="inline-flex items-baseline gap-0.5 mb-3 group"
              aria-label="GIAP KHAMPHA - trang chủ hệ sinh thái"
            >
              <span className="text-2xl font-black tracking-wide text-emerald-400 group-hover:text-emerald-300 transition-colors duration-200">
                GIAP
              </span>
              <span className="text-2xl font-black tracking-wide text-amber-400 group-hover:text-amber-300 transition-colors duration-200">
                KHAMPHA
              </span>
            </ExternalLink>

            {/* Tagline */}
            <p className="text-neutral-300 text-sm leading-relaxed mb-2">
              Nuôi dưỡng thế hệ số — Khám phá, học hỏi và phát triển cùng con 🌱
            </p>

            {/* Sub-line */}
            <p className="text-neutral-500 text-xs leading-relaxed mb-5">
              PDF Việt là một sản phẩm trong hệ sinh thái GIAP KHAMPHA — by Ba Maya
            </p>

            {/* CTA button */}
            <ExternalLink
              href="https://giapkhampha.me"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200"
              aria-label="Khám phá hệ sinh thái GIAP KHAMPHA"
            >
              Khám phá hệ sinh thái →
            </ExternalLink>
          </div>

          {/* b. Cột Khám Phá */}
          <div>
            <ColHeading>Khám Phá</ColHeading>
            <ul className="space-y-3" aria-label="Liên kết khám phá GIAP KHAMPHA">
              <NavLink href="https://giapkhampha.me">Trang Chủ GIAP KHAMPHA</NavLink>
              <NavLink href="https://giapkhampha.me/#san-pham">Sản Phẩm AI</NavLink>
              <NavLink href="https://giapkhampha.me/#bai-viet">Bài Viết & Góc Nhìn</NavLink>
              <NavLink href="https://giapkhampha.me/#sach-hay">Sách Hay Cho Bé</NavLink>
            </ul>
          </div>

          {/* c. Cột Sản phẩm khác */}
          <div>
            <ColHeading>Sản Phẩm Khác</ColHeading>
            <ul className="space-y-3" aria-label="Các sản phẩm trong hệ sinh thái">
              <li>
                <a
                  href="#"
                  className="text-neutral-400 hover:text-emerald-400 transition-colors duration-200 text-sm"
                >
                  App Bé Ngoan Kawaii
                </a>
              </li>
              <li>
                <span className="text-neutral-600 text-sm cursor-default select-none">
                  Sản phẩm sắp ra mắt…
                </span>
              </li>
            </ul>
          </div>

          {/* d. Cột Tài nguyên */}
          <div>
            <ColHeading>Tài Nguyên</ColHeading>
            <ul className="space-y-3" aria-label="Tài nguyên từ GIAP KHAMPHA">
              <NavLink href="https://giapkhampha.me/#tai-nguyen">Tài Nguyên Miễn Phí</NavLink>
              <NavLink href="https://giapkhampha.me/#tai-nguyen">Lộ Trình AI Cho Bé</NavLink>
              <NavLink href="https://giapkhampha.me/#ve-toi">Về Ba Maya</NavLink>
            </ul>
          </div>
        </div>

        {/* e. Bottom bar */}
        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-neutral-500 text-xs">
            © 2026 GIAP KHAMPHA · Made with ❤️ by Ba Maya
          </p>
          <p className="text-neutral-600 text-xs text-left sm:text-right">
            PDF Việt v0.1 · Xử lý hoàn toàn trên trình duyệt — file của bạn không được upload lên server
          </p>
        </div>
      </div>
    </footer>
  );
}
