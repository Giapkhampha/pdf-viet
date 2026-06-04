"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/app/components/ToolLayout";
import {
  analyzeText,
  formatReadingTime,
  formatBytes,
} from "@/app/lib/vietnamese/count-chars";

function StatCard({ label, value, sub, accent = "neutral" }) {
  const accentClasses = {
    emerald: "border-emerald-500/30 bg-emerald-950/20 text-emerald-300",
    amber:   "border-amber-500/30   bg-amber-950/20   text-amber-300",
    violet:  "border-violet-500/30  bg-violet-950/20  text-violet-300",
    blue:    "border-blue-500/30    bg-blue-950/20    text-blue-300",
    pink:    "border-pink-500/30    bg-pink-950/20    text-pink-300",
    cyan:    "border-cyan-500/30    bg-cyan-950/20    text-cyan-300",
    neutral: "border-neutral-800    bg-neutral-900    text-neutral-100",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 ${accentClasses[accent]}`}>
      <p className="text-xs uppercase tracking-wider opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function DemKyTuPage() {
  const [input, setInput] = useState("");

  const stats = useMemo(() => analyzeText(input), [input]);

  // Top 5 ký tự xuất hiện nhiều nhất (không tính khoảng trắng)
  const topChars = useMemo(() => {
    if (!input) return [];
    const counts = new Map();
    for (const ch of input.replace(/\s/g, "")) {
      counts.set(ch, (counts.get(ch) || 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [input]);

  return (
    <ToolLayout
      title="Đếm ký tự"
      icon="📊"
      desc="Đếm ký tự, từ, dòng, đoạn, câu — ước lượng thời gian đọc. Hiện real-time khi gõ. Hỗ trợ tiếng Việt có dấu và emoji."
    >
      <div className="space-y-5">
        {/* Input */}
        <div>
          <label
            htmlFor="dk-input"
            className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2"
          >
            Văn bản
          </label>
          <textarea
            id="dk-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Dán hoặc gõ văn bản vào đây. Em sẽ đếm cho bạn ngay lập tức..."
            rows={10}
            autoFocus
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/60 resize-y"
          />
          {input.length > 0 && (
            <button
              type="button"
              onClick={() => setInput("")}
              className="mt-2 text-xs text-neutral-500 hover:text-red-400 transition-colors"
            >
              Xoá hết để bắt đầu lại
            </button>
          )}
        </div>

        {/* Primary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Ký tự"
            value={stats.chars.toLocaleString("vi-VN")}
            sub={`Không kể space: ${stats.charsNoSpace.toLocaleString("vi-VN")}`}
            accent="emerald"
          />
          <StatCard
            label="Từ"
            value={stats.words.toLocaleString("vi-VN")}
            sub="Cách nhau bằng dấu cách"
            accent="amber"
          />
          <StatCard
            label="Câu"
            value={stats.sentences.toLocaleString("vi-VN")}
            sub="Kết thúc bằng . ! ?"
            accent="violet"
          />
          <StatCard
            label="Đoạn"
            value={stats.paragraphs.toLocaleString("vi-VN")}
            sub={`${stats.lines.toLocaleString("vi-VN")} dòng`}
            accent="cyan"
          />
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Thời gian đọc"
            value={formatReadingTime(stats.readingSeconds)}
            sub="Tốc độ trung bình 200 từ/phút"
            accent="pink"
          />
          <StatCard
            label="Kích thước (UTF-8)"
            value={formatBytes(stats.bytes)}
            sub="Khi lưu thành file .txt"
            accent="blue"
          />
        </div>

        {/* Top chars */}
        {topChars.length > 0 && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
              Top 5 ký tự xuất hiện nhiều nhất
            </p>
            <div className="flex flex-wrap gap-2">
              {topChars.map(([ch, count]) => (
                <span
                  key={ch}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5"
                >
                  <span className="text-base font-bold text-amber-400 font-mono">
                    {ch === " " ? "␣" : ch}
                  </span>
                  <span className="text-xs text-neutral-400">×{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tip */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-xs text-neutral-400">
          💡 <strong className="text-neutral-300">Mẹo:</strong> dùng để kiểm tra giới hạn ký tự
          (Twitter 280, meta description 160, SMS 160, bài viết Facebook 63.206...). Số liệu
          được tính real-time, không lưu lại sau khi đóng tab.
        </div>
      </div>
    </ToolLayout>
  );
}
