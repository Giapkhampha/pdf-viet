import Link from "next/link";
import EcosystemBadge from "@/app/components/EcosystemBadge";

/**
 * Khung trang chuẩn cho mọi tool: breadcrumb, icon + title, desc, badge
 * hệ sinh thái, dòng cam kết privacy. Dark theme đúng CONTEXT.md.
 */
export default function ToolLayout({ title, desc, icon, children }) {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-neutral-500">
          <Link href="/" className="hover:text-emerald-400 transition-colors">
            ← Về trang chủ
          </Link>
          <span className="mx-2 text-neutral-700">/</span>
          <span className="text-neutral-300">{title}</span>
        </nav>

        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {icon && (
              <span className="text-4xl" aria-hidden="true">
                {icon}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
              {title}
            </h1>
            <EcosystemBadge />
          </div>
          {desc && (
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              {desc}
            </p>
          )}
          <p className="text-emerald-400 text-xs sm:text-sm mt-2">
            🔒 Xử lý hoàn toàn trên trình duyệt — file của bạn không upload lên server.
          </p>
        </header>

        {children}
      </div>
    </main>
  );
}
