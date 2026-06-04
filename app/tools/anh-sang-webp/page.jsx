"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/app/components/ToolLayout";
import ToolDropzone from "@/app/components/ToolDropzone";
import { imageToWebp } from "@/app/lib/image/to-webp";
import { formatBytes, replaceExtension } from "@/app/lib/image/_shared";

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

export default function AnhSangWebpPage() {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(80);
  const [output, setOutput] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const file = files[0] || null;

  useEffect(() => {
    setOutput(null);
    setError("");
  }, [file, quality]);

  useEffect(() => {
    return () => {
      if (output?.url) URL.revokeObjectURL(output.url);
    };
  }, [output]);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    try {
      const blob = await imageToWebp(file, { quality: quality / 100 });
      const url = URL.createObjectURL(blob);
      const name = replaceExtension(file.name, "webp");
      setOutput({ blob, url, name });
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const reduction = output && file ? Math.round((1 - output.blob.size / file.size) * 100) : 0;

  return (
    <ToolLayout
      title="Ảnh sang WebP"
      icon="🌐"
      desc="Chuyển JPG, PNG sang WebP — định dạng ảnh hiện đại của Google nén tốt hơn 25-50% mà chất lượng cảm quan tương đương. Hỗ trợ bởi mọi trình duyệt hiện đại."
    >
      <div className="space-y-5">
        <ToolDropzone
          files={files}
          onChange={setFiles}
          accept="image/jpeg,image/png"
          multiple={false}
          maxSizeMB={50}
          disabled={processing}
        />

        {file && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="webp-quality" className="text-sm font-medium text-neutral-200">
                Chất lượng WebP
              </label>
              <span className="text-lg font-bold text-violet-300 font-mono tabular-nums">
                {quality}%
              </span>
            </div>
            <input
              id="webp-quality"
              type="range"
              min="20"
              max="100"
              step="5"
              value={quality}
              onChange={(e) => setQuality(+e.target.value)}
              disabled={processing}
              className="w-full accent-violet-500"
            />
            <p className="text-xs text-neutral-500">
              💡 Quality 80% là điểm cân bằng tốt nhất của WebP — khó phân biệt với 100% bằng mắt thường.
            </p>
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200">
            ⚠️ {error}
          </div>
        )}

        {file && (
          <button
            type="button"
            onClick={handleConvert}
            disabled={processing}
            className="w-full px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-neutral-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? "Đang chuyển..." : "Chuyển sang WebP"}
          </button>
        )}

        {output && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm text-emerald-300 font-medium">
                ✓ Đã chuyển — giảm {reduction}% dung lượng
              </p>
              <button
                type="button"
                onClick={() => downloadBlob(output.blob, output.name)}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-sm font-semibold transition-colors"
              >
                ⬇ Tải xuống .webp
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                <p className="text-neutral-500 uppercase tracking-wider">{file.type === "image/png" ? "PNG" : "JPG"} gốc</p>
                <p className="text-neutral-100 font-mono mt-1">{formatBytes(file.size)}</p>
              </div>
              <div className="rounded-lg border border-violet-500/30 bg-violet-950/30 p-3">
                <p className="text-violet-300 uppercase tracking-wider">WebP</p>
                <p className="text-violet-200 font-mono mt-1">{formatBytes(output.blob.size)}</p>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={output.url}
              alt="Kết quả WebP"
              className="max-w-full max-h-96 rounded-lg border border-neutral-800 mx-auto"
            />
          </div>
        )}

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-xs text-neutral-400">
          💡 <strong className="text-neutral-300">Khi nào dùng WebP?</strong> Khi cần tải nhanh
          ảnh lên web (blog, e-commerce), Facebook hỗ trợ WebP tốt. Email/Word/Zalo cũ có thể
          không nhận — lúc đó nên giữ JPG/PNG.
        </div>
      </div>
    </ToolLayout>
  );
}
