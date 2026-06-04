"use client";

import { useState } from "react";
import ToolLayout from "@/app/components/ToolLayout";
import { jsonToXlsx } from "@/app/lib/data/json-to-xlsx";

function downloadBytes(bytes, name) {
  const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

const SAMPLE = `[
  { "name": "Nguyễn Văn A", "age": 30, "city": "Hà Nội" },
  { "name": "Trần Thị B", "age": 25, "city": "TP. HCM" },
  { "name": "Lê Văn C", "age": 35, "city": "Đà Nẵng" }
]`;

export default function JsonSangExcelPage() {
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setJsonText(await f.text());
    e.target.value = "";
  };

  const handleConvert = async () => {
    if (!jsonText.trim()) {
      setError("Vui lòng dán JSON vào ô bên dưới.");
      return;
    }
    setProcessing(true);
    setError("");
    try {
      const bytes = await jsonToXlsx(jsonText);
      downloadBytes(bytes, "data.xlsx");
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="JSON sang Excel"
      icon="🔗"
      desc="Chuyển mảng JSON (array of objects) sang file Excel .xlsx. Mỗi key trong object trở thành 1 cột, mỗi phần tử thành 1 row."
    >
      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="json-input" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              JSON (array of objects)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setJsonText(SAMPLE)}
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                Dùng ví dụ
              </button>
              <label className="text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer">
                Tải file .json
                <input type="file" accept=".json,application/json" onChange={handleFile} className="hidden" />
              </label>
            </div>
          </div>
          <textarea
            id="json-input"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='[\n  { "name": "...", "age": 30 },\n  ...\n]'
            rows={12}
            spellCheck={false}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/60 resize-y font-mono"
          />
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200">
            ⚠️ {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleConvert}
          disabled={processing || !jsonText.trim()}
          className="w-full px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? "Đang tạo..." : "Tạo file Excel →"}
        </button>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-xs text-neutral-400">
          💡 <strong className="text-neutral-300">Format JSON:</strong> phải là <code className="text-amber-400">[ {`{...}, {...}`} ]</code> —
          mảng các object có cùng kiểu key. Object lồng nhau sẽ bị stringify thành text trong cell.
        </div>
      </div>
    </ToolLayout>
  );
}
