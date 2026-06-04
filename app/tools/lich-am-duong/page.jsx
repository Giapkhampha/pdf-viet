"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/app/components/ToolLayout";
import {
  convertSolar2Lunar,
  convertLunar2Solar,
  getCanChi,
} from "@/app/lib/vietnamese/lunar-calendar";

const WEEKDAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

function pad(n) {
  return String(n).padStart(2, "0");
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function ResultCard({ title, lines, accent = "emerald" }) {
  const accentMap = {
    emerald: "border-emerald-500/30 bg-emerald-950/20",
    amber:   "border-amber-500/30   bg-amber-950/20",
  };
  return (
    <div className={`rounded-xl border ${accentMap[accent]} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
        {title}
      </p>
      <div className="space-y-2">
        {lines.map((line, i) => (
          <div key={i} className="flex items-baseline justify-between gap-3">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">{line.label}</span>
            <span className={`text-sm font-semibold ${line.highlight ? "text-amber-300" : "text-neutral-100"}`}>
              {line.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LichAmDuongPage() {
  const [mode, setMode] = useState("s2l"); // s2l | l2s
  const [solarDate, setSolarDate] = useState(todayISO());
  const [lunarDay, setLunarDay] = useState(1);
  const [lunarMonth, setLunarMonth] = useState(1);
  const [lunarYear, setLunarYear] = useState(new Date().getFullYear());
  const [lunarLeap, setLunarLeap] = useState(false);

  const result = useMemo(() => {
    try {
      if (mode === "s2l") {
        if (!solarDate) return null;
        const [yy, mm, dd] = solarDate.split("-").map(Number);
        if (!yy || !mm || !dd) return null;
        const lunar = convertSolar2Lunar(dd, mm, yy);
        const canchi = getCanChi(dd, mm, yy);
        const weekday = WEEKDAYS[new Date(yy, mm - 1, dd).getDay()];
        return { mode, solar: { dd, mm, yy }, lunar, canchi, weekday };
      } else {
        const sol = convertLunar2Solar(lunarDay, lunarMonth, lunarYear, lunarLeap);
        if (!sol) {
          return { error: `Năm âm ${lunarYear} không có tháng ${lunarMonth} nhuận.` };
        }
        const canchi = getCanChi(sol.day, sol.month, sol.year);
        const weekday = WEEKDAYS[new Date(sol.year, sol.month - 1, sol.day).getDay()];
        return {
          mode,
          solar: { dd: sol.day, mm: sol.month, yy: sol.year },
          lunar: { day: lunarDay, month: lunarMonth, year: lunarYear, isLeapMonth: lunarLeap },
          canchi,
          weekday,
        };
      }
    } catch (err) {
      return { error: err.message || "Ngày không hợp lệ." };
    }
  }, [mode, solarDate, lunarDay, lunarMonth, lunarYear, lunarLeap]);

  return (
    <ToolLayout
      title="Đổi lịch âm ↔ dương"
      icon="🗓️"
      desc="Chuyển đổi 2 chiều giữa lịch dương và âm lịch theo lịch Việt Nam (UTC+7), kèm Can Chi ngày/tháng/năm. Thuật toán Hồ Ngọc Đức."
    >
      <div className="space-y-5">
        {/* Mode switcher */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("s2l")}
            className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
              mode === "s2l"
                ? "border-emerald-500/60 bg-emerald-950/30 text-emerald-300"
                : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700"
            }`}
          >
            ☀️ Dương → Âm
          </button>
          <button
            type="button"
            onClick={() => setMode("l2s")}
            className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
              mode === "l2s"
                ? "border-amber-500/60 bg-amber-950/30 text-amber-300"
                : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700"
            }`}
          >
            🌙 Âm → Dương
          </button>
        </div>

        {/* Input */}
        {mode === "s2l" ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <label htmlFor="solar-date" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
              Ngày dương lịch
            </label>
            <input
              id="solar-date"
              type="date"
              value={solarDate}
              onChange={(e) => setSolarDate(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500/60"
            />
            <button
              type="button"
              onClick={() => setSolarDate(todayISO())}
              className="mt-2 text-xs text-emerald-400 hover:text-emerald-300"
            >
              ↻ Hôm nay
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Ngày âm lịch
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label htmlFor="lunar-day" className="block text-xs text-neutral-500 mb-1">Ngày</label>
                <input
                  id="lunar-day"
                  type="number" min="1" max="30"
                  value={lunarDay}
                  onChange={(e) => setLunarDay(Math.max(1, Math.min(30, +e.target.value || 1)))}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500/60"
                />
              </div>
              <div>
                <label htmlFor="lunar-month" className="block text-xs text-neutral-500 mb-1">Tháng</label>
                <input
                  id="lunar-month"
                  type="number" min="1" max="12"
                  value={lunarMonth}
                  onChange={(e) => setLunarMonth(Math.max(1, Math.min(12, +e.target.value || 1)))}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500/60"
                />
              </div>
              <div>
                <label htmlFor="lunar-year" className="block text-xs text-neutral-500 mb-1">Năm</label>
                <input
                  id="lunar-year"
                  type="number" min="1900" max="2100"
                  value={lunarYear}
                  onChange={(e) => setLunarYear(+e.target.value || new Date().getFullYear())}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500/60"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={lunarLeap}
                onChange={(e) => setLunarLeap(e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
              Tháng nhuận
            </label>
          </div>
        )}

        {/* Result */}
        {result?.error ? (
          <div className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-4 text-sm text-red-200">
            ⚠️ {result.error}
          </div>
        ) : result ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ResultCard
              title="☀️ Dương lịch"
              accent="emerald"
              lines={[
                { label: "Ngày", value: `${pad(result.solar.dd)}/${pad(result.solar.mm)}/${result.solar.yy}`, highlight: mode === "l2s" },
                { label: "Thứ", value: result.weekday },
              ]}
            />
            <ResultCard
              title="🌙 Âm lịch"
              accent="amber"
              lines={[
                {
                  label: "Ngày",
                  value: `${pad(result.lunar.day)}/${pad(result.lunar.month)}/${result.lunar.year}${result.lunar.isLeapMonth ? " (nhuận)" : ""}`,
                  highlight: mode === "s2l",
                },
                { label: "Can Chi ngày", value: result.canchi.day },
                { label: "Can Chi tháng", value: result.canchi.month },
                { label: "Can Chi năm", value: result.canchi.year },
              ]}
            />
          </div>
        ) : null}

        {/* Tip */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-xs text-neutral-400">
          💡 <strong className="text-neutral-300">Mẹo:</strong> dùng để tra cứu ngày sinh âm
          lịch, chọn ngày tốt theo Can Chi, hoặc tính giỗ chạp. Tính toán theo lịch Việt Nam
          (UTC+7) nên có thể lệch 1 ngày với lịch âm Trung Quốc.
        </div>
      </div>
    </ToolLayout>
  );
}
