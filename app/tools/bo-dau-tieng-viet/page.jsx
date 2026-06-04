"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/app/components/ToolLayout";
import {
  removeDiacritics,
  toUrlSlug,
  toSafeFileName,
} from "@/app/lib/vietnamese/remove-diacritics";

const MODES = [
  { key: "plain",    label: "Bỏ dấu thường",   hint: "\"Tiếng Việt\" → \"Tieng Viet\"" },
  { key: "slug",     label: "URL slug",         hint: "\"Tiếng Việt 2026\" → \"tieng-viet-2026\"" },
  { key: "filename", label: "Tên file an toàn", hint: "Giữ ._- và bỏ ký tự đặc biệt" },
];

export default function BoDauPage() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("plain");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (mode === "slug") return toUrlSlug(input);
    if (mode === "filename") return toSafeFileName(input);
    return removeDiacritics(input);
  }, [input, mode]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Bỏ dấu tiếng Việt"
      icon="✨"
      desc="Chuyển 'Tiếng Việt' → 'Tieng Viet'. Dùng để tạo URL slug, tên file, mã sản phẩm — gõ tới đâu hiện kết quả tới đó."
    >
      <div className="space-y-5">
        {/* Mode selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className={`text-left rounded-xl border px-4 py-3 transition-colors ${
                mode === m.key
                  ? "border-emerald-500/60 bg-emerald-950/30"
                  : "border-neutral-800 bg-neutral-900 hover:border-neutral-700"
              }`}
            >
              <p className={`text-sm font-medium ${mode === m.key ? "text-emerald-300" : "text-neutral-200"}`}>
                {m.label}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">{m.hint}</p>
            </button>
          ))}
        </div>

        {/* Input */}
        <div>
          <label
            htmlFor="bd-input"
            className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2"
          >
            Văn bản tiếng Việt
          </label>
          <textarea
            id="bd-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ví dụ: Tiếng Việt rất đẹp và tinh tế..."
            rows={6}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/60 resize-y"
          />
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="bd-output"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-500"
            >
              Kết quả
            </label>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              className="text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-40 transition-colors"
            >
              {copied ? "✓ Đã sao chép!" : "⧉ Sao chép"}
            </button>
          </div>
          <textarea
            id="bd-output"
            readOnly
            value={output}
            placeholder="Kết quả hiện ở đây..."
            rows={6}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 resize-y font-mono"
          />
        </div>

        {/* Tip */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-xs text-neutral-400">
          💡 <strong className="text-neutral-300">Mẹo:</strong> URL slug thường dùng cho bài viết
          (vd <code className="text-amber-400">/bai-viet/nuoi-day-con-thoi-ai</code>). Tên file
          an toàn dùng khi đặt tên file tải xuống tránh lỗi unicode trên Windows cũ.
        </div>
      </div>
    </ToolLayout>
  );
}
