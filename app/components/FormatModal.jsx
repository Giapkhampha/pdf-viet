"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import PlanetIcon from "@/app/components/PlanetIcon";
import { getToolsByFormat } from "@/app/lib/format-map";

const accentBorder = {
  pink:    "border-pink-500/30    hover:border-pink-400/60",
  blue:    "border-blue-500/30    hover:border-blue-400/60",
  emerald: "border-emerald-500/30 hover:border-emerald-400/60",
  red:     "border-red-500/30     hover:border-red-400/60",
  amber:   "border-amber-500/30   hover:border-amber-400/60",
  violet:  "border-violet-500/30  hover:border-violet-400/60",
  indigo:  "border-indigo-500/30  hover:border-indigo-400/60",
  cyan:    "border-cyan-500/30    hover:border-cyan-400/60",
  orange:  "border-orange-500/30  hover:border-orange-400/60",
  teal:    "border-teal-500/30    hover:border-teal-400/60",
  gray:    "border-neutral-700    hover:border-neutral-500",
  purple:  "border-purple-500/30  hover:border-purple-400/60",
};

const accentText = {
  pink:    "text-pink-300",
  blue:    "text-blue-300",
  emerald: "text-emerald-300",
  red:     "text-red-300",
  amber:   "text-amber-300",
  violet:  "text-violet-300",
  indigo:  "text-indigo-300",
  cyan:    "text-cyan-300",
  orange:  "text-orange-300",
  teal:    "text-teal-300",
  gray:    "text-neutral-300",
  purple:  "text-purple-300",
};

function ToolCard({ tool }) {
  const ring = accentBorder[tool.accent] ?? accentBorder.violet;
  const txt = accentText[tool.accent] ?? accentText.violet;
  const isComing = tool.status !== "ready";

  const inner = (
    <div
      className={`group h-full rounded-xl border ${ring} bg-neutral-900/80 p-4 transition-all ${
        isComing ? "opacity-50" : "hover:bg-neutral-900 hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">
          {tool.icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={`text-sm font-semibold mb-1 ${isComing ? "text-neutral-400" : `text-neutral-100 group-hover:${txt}`}`}>
            {tool.title}
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
            {tool.desc}
          </p>
          {isComing && (
            <span className="inline-block mt-2 text-[10px] uppercase tracking-wider rounded-full border border-amber-800 bg-amber-950/40 text-amber-400 px-2 py-0.5">
              Sắp có
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (isComing) return <div>{inner}</div>;
  return (
    <Link
      href={`/tools/${tool.slug}`}
      aria-label={`Mở công cụ ${tool.title}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 rounded-xl"
    >
      {inner}
    </Link>
  );
}

/**
 * Modal hiển thị danh sách tool liên quan 1 format (PDF, WORD, ...).
 *
 * Props:
 *   format    — object từ FORMATS hoặc null (đóng)
 *   onClose   — callback đóng
 */
export default function FormatModal({ format, onClose }) {
  // ESC to close + lock body scroll khi mở
  useEffect(() => {
    if (!format) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [format, onClose]);

  if (!format) return null;
  // Defense-in-depth — modal chỉ tồn tại khi user click (đã ở client),
  // nhưng tránh crash nếu lỡ render server-side.
  if (typeof document === "undefined") return null;

  const list = getToolsByFormat(format.key);
  const readyCount = list.filter((t) => t.status === "ready").length;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="format-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-[fadeIn_0.2s_ease-out]"
      style={{
        animationName: "fadeIn",
        animationDuration: "0.2s",
        animationTimingFunction: "ease-out",
      }}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md cursor-default"
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-950/95 shadow-2xl"
        style={{
          animationName: "modalIn",
          animationDuration: "0.25s",
          animationTimingFunction: "ease-out",
          animationFillMode: "backwards",
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur px-5 sm:px-7 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <PlanetIcon label={format.label} color={format.accent} size={56} />
            <div className="min-w-0">
              <h2
                id="format-modal-title"
                className="text-lg sm:text-xl font-bold text-neutral-100"
              >
                Công cụ với <span className={accentText[format.accent]}>{format.label}</span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 truncate">
                {format.description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng modal"
            className="shrink-0 w-9 h-9 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-7 py-5">
          {list.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-3" aria-hidden="true">🚧</p>
              <p className="text-neutral-300 font-medium mb-1">
                Chưa có công cụ nào với {format.label}
              </p>
              <p className="text-sm text-neutral-500">
                Đang phát triển — theo dõi GIAP KHAMPHA để biết khi nào ra mắt.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs sm:text-sm text-neutral-500 mb-4">
                {readyCount} công cụ sẵn sàng
                {list.length > readyCount && (
                  <span className="text-amber-400">
                    {" "}· {list.length - readyCount} sắp có
                  </span>
                )}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {list.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 px-5 sm:px-7 py-3 flex items-center justify-between gap-3">
          <p className="text-xs text-neutral-500 hidden sm:block">
            🔒 Tất cả xử lý 100% trên trình duyệt
          </p>
          <Link
            href="/#cong-cu"
            onClick={onClose}
            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Xem toàn bộ công cụ →
          </Link>
        </div>
      </div>

      {/* keyframes inline để không phải sửa globals.css */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}
