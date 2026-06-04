"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/app/components/ToolLayout";
import { vniToUnicode } from "@/app/lib/vietnamese/vni-to-unicode";

const EXAMPLES = [
  { vni: "Tie61ng Vie65t",         expected: "Tiếng Việt" },
  { vni: "Ca2 phe6 sua74a",        expected: "Cà phê sữa" },
  { vni: "Cha2o ba5n",             expected: "Chào bạn" },
  { vni: "Vie65t Nam mu7o72i nam", expected: "Việt Nam mười năm" },
];

export default function VniUnicodePage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => vniToUnicode(input), [input]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Chuyển VNI → Unicode"
      icon="🔤"
      desc="Chuyển văn bản gõ bằng keystroke VNI (số thay cho dấu) sang Unicode chuẩn. Phù hợp với máy không cài bộ gõ tiếng Việt — gõ a61 thay vì ấ, o72 thay vì ờ."
    >
      <div className="space-y-5">
        {/* Bảng quy tắc */}
        <details className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-neutral-200 hover:bg-neutral-800/50 transition-colors">
            📖 Quy tắc gõ VNI (bấm để xem)
          </summary>
          <div className="px-4 pb-4 pt-2 text-sm text-neutral-400 space-y-2 border-t border-neutral-800">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <p><code className="text-amber-400">1</code> = sắc (a1 → á)</p>
              <p><code className="text-amber-400">2</code> = huyền (a2 → à)</p>
              <p><code className="text-amber-400">3</code> = hỏi (a3 → ả)</p>
              <p><code className="text-amber-400">4</code> = ngã (a4 → ã)</p>
              <p><code className="text-amber-400">5</code> = nặng (a5 → ạ)</p>
              <p><code className="text-amber-400">6</code> = mũ (a6 → â, o6 → ô)</p>
              <p><code className="text-amber-400">7</code> = móc (o7 → ơ, u7 → ư)</p>
              <p><code className="text-amber-400">8</code> = breve (a8 → ă)</p>
              <p><code className="text-amber-400">9</code> = stroke (d9 → đ)</p>
            </div>
            <p className="text-xs text-neutral-500 pt-2">
              <strong>Kết hợp:</strong> a61 → ấ (â + sắc), o72 → ờ (ơ + huyền), u75 → ự.
            </p>
          </div>
        </details>

        {/* Input */}
        <div>
          <label
            htmlFor="vni-input"
            className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2"
          >
            Văn bản gõ VNI
          </label>
          <textarea
            id="vni-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ví dụ: Tie61ng Vie65t cu3a chu1ng ta..."
            rows={5}
            spellCheck={false}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/60 resize-y font-mono"
          />
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="vni-output"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-500"
            >
              Kết quả Unicode
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
            id="vni-output"
            readOnly
            value={output}
            placeholder="Kết quả Unicode hiện ở đây..."
            rows={5}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 resize-y"
          />
        </div>

        {/* Examples */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
            Ví dụ — bấm để thử
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.vni}
                type="button"
                onClick={() => setInput(ex.vni)}
                className="text-left rounded-lg border border-neutral-800 bg-neutral-950 hover:border-emerald-500/40 px-3 py-2 transition-colors"
              >
                <p className="text-xs font-mono text-amber-400 truncate">{ex.vni}</p>
                <p className="text-xs text-neutral-400 mt-0.5 truncate">→ {ex.expected}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 px-4 py-3 text-xs text-amber-200">
          ⚠️ <strong>Phiên bản beta:</strong> chỉ chuyển keystroke VNI cơ bản. Một số trường hợp
          đặt dấu phức tạp (vd dấu trên ơ trong từ &quot;người&quot;) có thể chưa chuẩn 100% —
          bạn check lại trước khi dùng.
        </div>
      </div>
    </ToolLayout>
  );
}
