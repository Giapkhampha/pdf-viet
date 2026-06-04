import Link from "next/link";
import { CATEGORIES, getToolsByCategory } from "@/app/lib/tools-registry";
import CosmicHero from "@/app/components/CosmicHero";

const accentRing = {
  emerald: "from-emerald-500/10 ring-emerald-500/20 text-emerald-400",
  teal:    "from-teal-500/10    ring-teal-500/20    text-teal-300",
  amber:   "from-amber-500/10   ring-amber-500/20   text-amber-400",
  blue:    "from-blue-500/10    ring-blue-500/20    text-blue-300",
  indigo:  "from-indigo-500/10  ring-indigo-500/20  text-indigo-300",
  violet:  "from-violet-500/10  ring-violet-500/20  text-violet-300",
  purple:  "from-purple-500/10  ring-purple-500/20  text-purple-300",
  pink:    "from-pink-500/10    ring-pink-500/20    text-pink-300",
  orange:  "from-orange-500/10  ring-orange-500/20  text-orange-300",
  red:     "from-red-500/10     ring-red-500/20     text-red-300",
  cyan:    "from-cyan-500/10    ring-cyan-500/20    text-cyan-300",
  gray:    "from-neutral-500/10 ring-neutral-500/20 text-neutral-300",
};

function ToolCard({ tool }) {
  const ring = accentRing[tool.accent] ?? accentRing.emerald;
  const isComing = tool.status !== "ready";

  const inner = (
    <div
      className={[
        "group h-full relative rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5",
        "transition-all duration-200",
        isComing
          ? "opacity-60 cursor-not-allowed"
          : "hover:border-emerald-500/40 hover:bg-neutral-900 hover:-translate-y-0.5",
      ].join(" ")}
    >
      <div
        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${ring} ring-1 flex items-center justify-center text-2xl mb-3`}
        aria-hidden="true"
      >
        {tool.icon}
      </div>
      <h3 className="font-semibold text-neutral-100 text-sm mb-1 group-hover:text-emerald-400 transition-colors">
        {tool.title}
      </h3>
      <p className="text-xs text-neutral-500 leading-relaxed">{tool.desc}</p>

      {isComing && (
        <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider rounded-full border border-amber-800 bg-amber-950/40 text-amber-400 px-2 py-0.5">
          Sắp có
        </span>
      )}
    </div>
  );

  if (isComing) {
    return <div aria-disabled="true">{inner}</div>;
  }

  return (
    <Link
      href={`/tools/${tool.slug}`}
      aria-label={`Mở công cụ ${tool.title}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 rounded-2xl"
    >
      {inner}
    </Link>
  );
}

function CategorySection({ category }) {
  const list = getToolsByCategory(category.key);
  if (list.length === 0) return null;
  return (
    <section className="mb-12" aria-labelledby={`cat-${category.key}`}>
      <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2
            id={`cat-${category.key}`}
            className="text-xl sm:text-2xl font-bold text-neutral-100"
          >
            {category.title}
          </h2>
          <p className="text-sm text-neutral-500 mt-1">{category.desc}</p>
        </div>
        <span className="text-xs text-neutral-600">
          {list.filter((t) => t.status === "ready").length}/{list.length} công cụ
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {list.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <CosmicHero />

      <main
        id="cong-cu"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 scroll-mt-20"
      >
        <div className="mb-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-100">
            Toàn bộ công cụ
          </h2>
          <p className="text-sm text-neutral-500 mt-2">
            Bấm vào tool để bắt đầu — tất cả chạy ngay trên trình duyệt.
          </p>
        </div>
        {CATEGORIES.map((cat) => (
          <CategorySection key={cat.key} category={cat} />
        ))}
      </main>
    </>
  );
}
