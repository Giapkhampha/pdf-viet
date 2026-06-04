import PlanetIcon from "@/app/components/PlanetIcon";
import CosmicBackground from "@/app/components/CosmicBackground";

/**
 * Một hành tinh đặt absolute position quanh hero, có animation float riêng.
 * positionClass: Tailwind position (top/left/right/bottom + translate).
 * visibleClass: control visibility theo breakpoint (vd "hidden md:block").
 */
function FloatingPlanet({ label, color, size, positionClass, visibleClass = "", animClass, delay = "0s" }) {
  return (
    <div
      className={`absolute ${positionClass} ${visibleClass} ${animClass}`}
      style={{ animationDelay: delay }}
    >
      <PlanetIcon label={label} color={color} size={size} />
    </div>
  );
}

export default function CosmicHero() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-800">
      <CosmicBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[520px] sm:min-h-[640px] lg:min-h-[720px]">
        {/* ─── Hành tinh xếp tròn ─────────────────────────────────────────── */}

        {/* PDF trung tâm phía trên */}
        <FloatingPlanet
          label="PDF"
          color="pink"
          size={130}
          positionClass="top-[3%] left-1/2 -translate-x-1/2"
          animClass="animate-float-slow"
        />

        {/* Hàng 1 — gần PDF */}
        <FloatingPlanet
          label="WORD"
          color="blue"
          size={90}
          positionClass="top-[16%] left-[18%] sm:left-[22%]"
          animClass="animate-float-mid"
          delay="0.5s"
        />
        <FloatingPlanet
          label="EXCEL"
          color="emerald"
          size={90}
          positionClass="top-[16%] right-[18%] sm:right-[22%]"
          animClass="animate-float-mid"
          delay="1.2s"
        />

        {/* Hàng 2 — 2 bên xa */}
        <FloatingPlanet
          label="PPT"
          color="red"
          size={86}
          positionClass="top-[42%] left-[4%] sm:left-[8%]"
          visibleClass="hidden sm:block"
          animClass="animate-float-fast"
          delay="0.8s"
        />
        <FloatingPlanet
          label="JPG"
          color="amber"
          size={86}
          positionClass="top-[42%] right-[4%] sm:right-[8%]"
          visibleClass="hidden sm:block"
          animClass="animate-float-fast"
          delay="1.5s"
        />

        {/* Hàng 3 — dưới */}
        <FloatingPlanet
          label="HTML"
          color="indigo"
          size={84}
          positionClass="bottom-[18%] left-[14%] sm:left-[20%]"
          visibleClass="hidden lg:block"
          animClass="animate-float-mid"
          delay="0.2s"
        />
        <FloatingPlanet
          label="PNG"
          color="violet"
          size={84}
          positionClass="bottom-[18%] right-[14%] sm:right-[20%]"
          visibleClass="hidden lg:block"
          animClass="animate-float-mid"
          delay="1.8s"
        />

        {/* Hàng 4 — đáy giữa */}
        <FloatingPlanet
          label="MD"
          color="violet"
          size={78}
          positionClass="bottom-[6%] left-[32%] sm:left-[38%]"
          visibleClass="hidden md:block"
          animClass="animate-float-slow"
          delay="2.1s"
        />
        <FloatingPlanet
          label="TXT"
          color="cyan"
          size={78}
          positionClass="bottom-[6%] right-[32%] sm:right-[38%]"
          visibleClass="hidden md:block"
          animClass="animate-float-slow"
          delay="0.6s"
        />

        {/* ─── Title + CTA giữa ──────────────────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center pt-32 sm:pt-40 lg:pt-44 pb-32 sm:pb-40">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-800/70 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-400 mb-6 backdrop-blur-sm">
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
            Chuyển đổi PDF, Word, Excel, ảnh, OCR tiếng Việt — nhanh chóng,
            <br className="hidden sm:block" />
            <span className="text-emerald-400">không upload server</span>, hoàn toàn miễn phí.
          </p>

          <a
            href="#cong-cu"
            className="group mt-8 inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-gradient-to-r from-violet-500/20 to-pink-500/20 hover:from-violet-500/30 hover:to-pink-500/30 px-7 py-3.5 text-sm sm:text-base font-semibold text-neutral-100 backdrop-blur-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            aria-label="Cuộn xuống danh sách công cụ"
          >
            <span className="text-violet-300" aria-hidden="true">✦</span>
            Bắt đầu chuyển đổi
            <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
          </a>

          <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              🔒 100% trên trình duyệt
            </span>
            <span className="inline-flex items-center gap-1.5">
              🇻🇳 Tối ưu cho tiếng Việt
            </span>
            <span className="inline-flex items-center gap-1.5">
              ⚡ Không cần đăng ký
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
