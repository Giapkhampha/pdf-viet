"use client";

import { useState } from "react";
import PlanetIcon from "@/app/components/PlanetIcon";
import CosmicBackground from "@/app/components/CosmicBackground";
import FormatModal from "@/app/components/FormatModal";
import { FORMATS, HERO_FORMAT_KEYS } from "@/app/lib/format-map";

/**
 * Một hành tinh trong hero — button click để mở FormatModal.
 *   formatKey      — key trong FORMATS (vd "pdf")
 *   size           — px
 *   positionClass  — Tailwind position (top/left/right/bottom + translate)
 *   visibleClass   — vd "hidden md:block" để ẩn trên mobile
 *   animClass      — vd "animate-float-mid"
 *   delay          — CSS animation-delay
 *   onClick        — (format) => void
 */
function FloatingPlanet({
  formatKey,
  size,
  positionClass,
  visibleClass = "",
  animClass,
  delay = "0s",
  onClick,
}) {
  const f = FORMATS[formatKey];
  if (!f) return null;
  return (
    <button
      type="button"
      onClick={() => onClick(f)}
      aria-label={`Xem công cụ chuyển đổi với ${f.label}`}
      className={[
        "absolute group/planet cursor-pointer",
        "bg-transparent border-0 p-0 rounded-full",
        "transition-transform duration-200 ease-out hover:scale-110 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
        positionClass,
        visibleClass,
        animClass,
      ].join(" ")}
      style={{ animationDelay: delay }}
    >
      <PlanetIcon label={f.label} color={f.accent} size={size} />
      {/* Tooltip nhẹ khi hover */}
      <span
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1.5 whitespace-nowrap rounded-md bg-neutral-900/90 border border-neutral-700 px-2 py-0.5 text-[10px] text-neutral-300 opacity-0 group-hover/planet:opacity-100 transition-opacity"
        aria-hidden="true"
      >
        Bấm để xem công cụ
      </span>
    </button>
  );
}

/**
 * Hành tinh cho layout điện thoại — xếp theo flow trong lưới 3×3, KHÔNG absolute
 * nên không đè lên tiêu đề. Hiển thị đủ 9 định dạng, vẫn bấm được để mở modal.
 */
function MobilePlanet({ formatKey, index = 0, onClick }) {
  const f = FORMATS[formatKey];
  if (!f) return null;
  const anim = ["animate-float-slow", "animate-float-mid", "animate-float-fast"][index % 3];
  return (
    <button
      type="button"
      onClick={() => onClick(f)}
      aria-label={`Xem công cụ chuyển đổi với ${f.label}`}
      className={[
        "bg-transparent border-0 p-0 rounded-full",
        "transition-transform duration-200 ease-out active:scale-90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
        anim,
      ].join(" ")}
      style={{ animationDelay: `${(index % 5) * 0.35}s` }}
    >
      <PlanetIcon label={f.label} color={f.accent} size={66} />
    </button>
  );
}

export default function CosmicHero() {
  const [selectedFormat, setSelectedFormat] = useState(null);

  return (
    <>
      <section className="relative overflow-hidden border-b border-neutral-800">
        <CosmicBackground />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sm:min-h-[640px] lg:min-h-[720px]">
          {/* Cụm hành tinh nổi (absolute) — chỉ hiện từ tablet trở lên.
              Trên điện thoại dùng lưới 3×3 gọn bên dưới để không đè lên chữ. */}
          <div className="hidden sm:block">
          {/* PDF trung tâm phía trên */}
          <FloatingPlanet
            formatKey="pdf"
            size={130}
            positionClass="top-[3%] left-1/2 -translate-x-1/2"
            animClass="animate-float-slow"
            onClick={setSelectedFormat}
          />

          {/* Hàng 1 — gần PDF */}
          <FloatingPlanet
            formatKey="word"
            size={90}
            positionClass="top-[16%] left-[18%] sm:left-[22%]"
            animClass="animate-float-mid"
            delay="0.5s"
            onClick={setSelectedFormat}
          />
          <FloatingPlanet
            formatKey="excel"
            size={90}
            positionClass="top-[16%] right-[18%] sm:right-[22%]"
            animClass="animate-float-mid"
            delay="1.2s"
            onClick={setSelectedFormat}
          />

          {/* Hàng 2 — 2 bên xa */}
          <FloatingPlanet
            formatKey="ppt"
            size={86}
            positionClass="top-[42%] left-[4%] sm:left-[8%]"
            visibleClass="hidden sm:block"
            animClass="animate-float-fast"
            delay="0.8s"
            onClick={setSelectedFormat}
          />
          <FloatingPlanet
            formatKey="jpg"
            size={86}
            positionClass="top-[42%] right-[4%] sm:right-[8%]"
            visibleClass="hidden sm:block"
            animClass="animate-float-fast"
            delay="1.5s"
            onClick={setSelectedFormat}
          />

          {/* Hàng 3 — dưới */}
          <FloatingPlanet
            formatKey="html"
            size={84}
            positionClass="bottom-[18%] left-[14%] sm:left-[20%]"
            visibleClass="hidden lg:block"
            animClass="animate-float-mid"
            delay="0.2s"
            onClick={setSelectedFormat}
          />
          <FloatingPlanet
            formatKey="png"
            size={84}
            positionClass="bottom-[18%] right-[14%] sm:right-[20%]"
            visibleClass="hidden lg:block"
            animClass="animate-float-mid"
            delay="1.8s"
            onClick={setSelectedFormat}
          />

          {/* Hàng 4 — đáy giữa */}
          <FloatingPlanet
            formatKey="md"
            size={78}
            positionClass="bottom-[6%] left-[32%] sm:left-[38%]"
            visibleClass="hidden md:block"
            animClass="animate-float-slow"
            delay="2.1s"
            onClick={setSelectedFormat}
          />
          <FloatingPlanet
            formatKey="txt"
            size={78}
            positionClass="bottom-[6%] right-[32%] sm:right-[38%]"
            visibleClass="hidden md:block"
            animClass="animate-float-slow"
            delay="0.6s"
            onClick={setSelectedFormat}
          />
          </div>

          {/* ─── Title + CTA giữa ─── */}
          {/* pointer-events-none ở wrapper để click xuyên qua bắt được planet phía dưới;
              các phần tử cần click (link, button) tự bật pointer-events-auto. */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center pt-10 sm:pt-40 lg:pt-44 pb-16 sm:pb-40 pointer-events-none">
            {/* Lưới hành tinh cho điện thoại — đủ 9 định dạng, không đè lên tiêu đề. */}
            <div className="sm:hidden pointer-events-auto mb-9 grid grid-cols-3 gap-3 justify-items-center max-w-[17rem]">
              {HERO_FORMAT_KEYS.map((key, i) => (
                <MobilePlanet key={key} formatKey={key} index={i} onClick={setSelectedFormat} />
              ))}
            </div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-800/70 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-400 mb-6 backdrop-blur-sm pointer-events-auto">
              🌱 Một phần của hệ sinh thái{" "}
              <a
                href="https://giapkhampha.me"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline underline-offset-2 hover:text-emerald-300"
              >
                GIAP KHAMPHA
              </a>
            </p>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-100 leading-tight">
              Chọn định dạng{" "}
              <span className="bg-gradient-to-r from-violet-300 via-pink-300 to-amber-300 bg-clip-text text-transparent">
                bạn muốn
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base sm:text-lg text-neutral-400 leading-relaxed">
              Bấm vào quả cầu để xem các công cụ chuyển đổi với định dạng đó.
              <br className="hidden sm:block" />
              <span className="text-emerald-400">Không upload server</span>, hoàn toàn miễn phí.
            </p>

            <button
              type="button"
              onClick={() => setSelectedFormat(FORMATS.pdf)}
              className="group pointer-events-auto mt-8 inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-gradient-to-r from-violet-500/20 to-pink-500/20 hover:from-violet-500/30 hover:to-pink-500/30 px-7 py-3.5 text-sm sm:text-base font-semibold text-neutral-100 backdrop-blur-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 cursor-pointer"
              aria-label="Mở danh sách công cụ với PDF"
            >
              <span className="text-violet-300" aria-hidden="true">✦</span>
              Bắt đầu với PDF
              <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
            </button>

            <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-neutral-500">
              <span className="inline-flex items-center gap-1.5">🔒 100% trên trình duyệt</span>
              <span className="inline-flex items-center gap-1.5">🇻🇳 Tối ưu cho tiếng Việt</span>
              <span className="inline-flex items-center gap-1.5">⚡ Không cần đăng ký</span>
            </div>

            <a
              href="#cong-cu"
              className="pointer-events-auto mt-6 text-xs text-neutral-500 hover:text-emerald-400 transition-colors underline underline-offset-4"
            >
              Hoặc xem toàn bộ công cụ phía dưới ↓
            </a>
          </div>
        </div>
      </section>

      <FormatModal
        format={selectedFormat}
        onClose={() => setSelectedFormat(null)}
      />
    </>
  );
}
