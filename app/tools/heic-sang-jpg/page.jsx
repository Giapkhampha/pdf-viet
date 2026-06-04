"use client";

import { useState } from "react";
import ToolLayout from "@/app/components/ToolLayout";
import ToolDropzone from "@/app/components/ToolDropzone";
import { heicToJpg } from "@/app/lib/image/heic-to-jpg";
import { formatBytes, replaceExtension } from "@/app/lib/image/_shared";

const QUALITY_PRESETS = [
  { value: 0.95, label: "Cao",   desc: "Giữ chất lượng gần như gốc" },
  { value: 0.85, label: "Vừa",   desc: "Cân bằng giữa chất lượng và dung lượng" },
  { value: 0.7,  label: "Thấp",  desc: "File nhẹ nhất, hợp gửi qua mạng" },
];

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export default function HeicToJpgPage() {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(0.92);
  const [results, setResults] = useState([]); // {file, blob, newName, error}
  const [processing, setProcessing] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const handleConvert = async () => {
    setGlobalError("");
    setProcessing(true);
    setResults([]);

    const out = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const blob = await heicToJpg(file, { quality });
        const newName = replaceExtension(file.name, "jpg");
        out.push({ file, blob, newName, error: null });
        setResults([...out]); // update dần
      } catch (err) {
        out.push({ file, blob: null, newName: null, error: err.message });
        setResults([...out]);
      }
    }
    setProcessing(false);
  };

  const handleDownloadAll = () => {
    for (const r of results) {
      if (r.blob) downloadBlob(r.blob, r.newName);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResults([]);
    setGlobalError("");
  };

  const successCount = results.filter((r) => r.blob).length;
  const errorCount = results.filter((r) => r.error).length;

  return (
    <ToolLayout
      title="HEIC sang JPG"
      icon="📷"
      desc="Chuyển ảnh HEIC/HEIF từ iPhone sang JPG dùng được trên Windows, Facebook, Word, web. Chuyển batch nhiều ảnh cùng lúc. Toàn bộ xử lý trên máy bạn — file không upload."
    >
      <div className="space-y-5">
        <ToolDropzone
          files={files}
          onChange={setFiles}
          accept=".heic,.heif"
          multiple
          maxSizeMB={50}
          disabled={processing}
        />

        {/* Quality presets */}
        {files.length > 0 && results.length === 0 && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
              Chất lượng JPG
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {QUALITY_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setQuality(p.value)}
                  className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                    quality === p.value
                      ? "border-pink-500/60 bg-pink-950/30"
                      : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                  }`}
                >
                  <p className={`text-sm font-medium ${quality === p.value ? "text-pink-300" : "text-neutral-200"}`}>
                    {p.label} <span className="text-xs text-neutral-500">({Math.round(p.value * 100)}%)</span>
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {globalError && (
          <div role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200">
            ⚠️ {globalError}
          </div>
        )}

        {/* Action buttons */}
        {files.length > 0 && results.length === 0 && (
          <button
            type="button"
            onClick={handleConvert}
            disabled={processing}
            className="w-full px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-400 text-neutral-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? "Đang chuyển..." : `Chuyển ${files.length} ảnh sang JPG`}
          </button>
        )}

        {/* Progress khi đang chạy */}
        {processing && (
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-300 flex items-center gap-3">
            <span className="w-3 h-3 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
            Đang xử lý {results.length}/{files.length}...
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm font-medium text-neutral-200">
                Kết quả: <span className="text-emerald-400">{successCount}</span> thành công
                {errorCount > 0 && <span className="text-red-400"> · {errorCount} lỗi</span>}
              </p>
              <div className="flex gap-2">
                {successCount > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadAll}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-sm font-semibold transition-colors"
                  >
                    ⬇ Tải tất cả ({successCount})
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg border border-neutral-700 text-sm text-neutral-300 hover:border-neutral-500 transition-colors"
                >
                  Bắt đầu lại
                </button>
              </div>
            </div>
            <ul className="space-y-2">
              {results.map((r, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                    r.error
                      ? "border-red-900/50 bg-red-950/20"
                      : "border-emerald-500/30 bg-emerald-950/20"
                  }`}
                >
                  <span className="text-xl shrink-0" aria-hidden="true">{r.error ? "⚠️" : "✓"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-100 truncate">{r.file.name}</p>
                    {r.error ? (
                      <p className="text-xs text-red-300 mt-0.5">{r.error}</p>
                    ) : (
                      <p className="text-xs text-neutral-400 mt-0.5">
                        → {r.newName} · {formatBytes(r.blob.size)} (giảm{" "}
                        {Math.round((1 - r.blob.size / r.file.size) * 100)}%)
                      </p>
                    )}
                  </div>
                  {r.blob && (
                    <button
                      type="button"
                      onClick={() => downloadBlob(r.blob, r.newName)}
                      className="shrink-0 px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-100 transition-colors"
                    >
                      ⬇ Tải
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-xs text-neutral-400">
          💡 <strong className="text-neutral-300">Mẹo:</strong> iPhone từ iOS 11 chụp ảnh
          mặc định bằng HEIC để tiết kiệm dung lượng. Khi gửi sang Windows hoặc Facebook,
          ảnh có thể không mở được — dùng tool này để chuyển sang JPG.
        </div>
      </div>
    </ToolLayout>
  );
}
