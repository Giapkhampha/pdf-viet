"use client";

import { useState } from "react";
import ToolLayout from "@/app/components/ToolLayout";
import { generateBarcodeDataUrl, BARCODE_TYPES } from "@/app/lib/barcode/generate";

export default function TaoMaVachPage() {
  const [text, setText] = useState("");
  const [type, setType] = useState("code128");
  const [scale, setScale] = useState(3);
  const [includeText, setIncludeText] = useState(true);
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("Vui lòng nhập nội dung mã vạch.");
      return;
    }
    setProcessing(true);
    setError("");
    setDataUrl("");
    try {
      const url = await generateBarcodeDataUrl(text, { type, scale, includeText });
      setDataUrl(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `barcode-${type}-${Date.now()}.png`;
    a.click();
  };

  return (
    <ToolLayout
      title="Tạo mã vạch"
      icon="📊"
      desc="Tạo mã vạch Code 128, Code 39, EAN-13, EAN-8. Dùng cho in nhãn sản phẩm, theo dõi kho, danh sách lớp học. Tải về PNG."
    >
      <div className="space-y-5">
        {/* Type picker */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Loại mã vạch
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {BARCODE_TYPES.map((bt) => (
              <button
                key={bt.value}
                type="button"
                onClick={() => setType(bt.value)}
                className={`text-left rounded-xl border px-4 py-3 transition-colors ${
                  type === bt.value
                    ? "border-violet-500/60 bg-violet-950/30"
                    : "border-neutral-800 bg-neutral-900 hover:border-neutral-700"
                }`}
              >
                <p className={`text-sm font-medium ${type === bt.value ? "text-violet-300" : "text-neutral-200"}`}>
                  {bt.label}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">{bt.note}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div>
          <label htmlFor="bc-input" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
            Nội dung
          </label>
          <input
            id="bc-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={type === "ean13" ? "12 chữ số (số 13 tự sinh)" : type === "ean8" ? "7 chữ số (số 8 tự sinh)" : "Văn bản hoặc số"}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-violet-500/60 font-mono"
          />
        </div>

        {/* Options */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="bc-scale" className="text-sm text-neutral-300">Độ phóng (scale)</label>
              <span className="text-sm font-mono text-violet-300">{scale}x</span>
            </div>
            <input
              id="bc-scale"
              type="range" min="1" max="10" step="1"
              value={scale}
              onChange={(e) => setScale(+e.target.value)}
              className="w-full accent-violet-500"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeText}
              onChange={(e) => setIncludeText(e.target.checked)}
              className="w-4 h-4 accent-violet-500"
            />
            Hiện text dưới mã vạch
          </label>
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200">
            ⚠️ {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={processing || !text.trim()}
          className="w-full px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-neutral-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? "Đang tạo..." : "Tạo mã vạch →"}
        </button>

        {dataUrl && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-center">
            <p className="text-sm text-emerald-300 font-medium mb-3">✓ Đã tạo mã vạch</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dataUrl}
              alt={`${type} barcode`}
              className="mx-auto rounded-lg border border-neutral-800 bg-white p-3 max-w-full"
            />
            <button
              type="button"
              onClick={handleDownload}
              className="mt-4 inline-flex px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-sm font-semibold transition-colors"
            >
              ⬇ Tải PNG
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
