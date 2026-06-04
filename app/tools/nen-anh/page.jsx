"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/app/components/ToolLayout";
import ToolDropzone from "@/app/components/ToolDropzone";
import { compressImage } from "@/app/lib/image/compress";
import { formatBytes } from "@/app/lib/image/_shared";

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

export default function NenAnhPage() {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(70);
  const [output, setOutput] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const file = files[0] || null;
  const isPng = file?.type === "image/png";

  useEffect(() => {
    setOutput(null);
    setError("");
  }, [file, quality]);

  useEffect(() => {
    return () => {
      if (output?.url) URL.revokeObjectURL(output.url);
    };
  }, [output]);

  const handleCompress = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    try {
      const blob = await compressImage(file, { quality: quality / 100 });
      const url = URL.createObjectURL(blob);
      const name = `nen_${file.name}`;
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
      title="Nén ảnh"
      icon="🗜️"
      desc="Giảm dung lượng ảnh JPG, PNG, WebP. Tuỳ chỉnh chất lượng từ 10-100%. Xử lý 100% trên trình duyệt, file không upload."
    >
      <div className="space-y-5">
        <ToolDropzone
          files={files}
          onChange={setFiles}
          accept="image/jpeg,image/png,image/webp"
          multiple={false}
          maxSizeMB={50}
          disabled={processing}
        />

        {file && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="quality" className="text-sm font-medium text-neutral-200">
                Chất lượng
              </label>
              <span className="text-lg font-bold text-indigo-300 font-mono tabular-nums">
                {quality}%
              </span>
            </div>
            <input
              id="quality"
              type="range"
              min="10"
              max="100"
              step="5"
              value={quality}
              onChange={(e) => setQuality(+e.target.value)}
              disabled={processing}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Nhẹ nhất</span>
              <span>Cân bằng</span>
              <span>Đẹp nhất</span>
            </div>
            {isPng && (
              <p className="text-xs text-amber-300 bg-amber-950/30 border border-amber-900/40 rounded-lg px-3 py-2">
                ℹ️ PNG là định dạng <strong>lossless</strong> — giảm chất lượng không nhiều
                tác dụng. Để giảm dung lượng đáng kể, dùng tool <strong>Ảnh sang WebP</strong>.
              </p>
            )}
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
            onClick={handleCompress}
            disabled={processing}
            className="w-full px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-neutral-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? "Đang nén..." : `Nén ảnh — chất lượng ${quality}%`}
          </button>
        )}

        {output && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm text-emerald-300 font-medium">
                ✓ Đã nén — {reduction > 0 ? "giảm" : "tăng"} {Math.abs(reduction)}%
              </p>
              <button
                type="button"
                onClick={() => downloadBlob(output.blob, output.name)}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-sm font-semibold transition-colors"
              >
                ⬇ Tải xuống
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                <p className="text-neutral-500 uppercase tracking-wider">Gốc</p>
                <p className="text-neutral-100 font-mono mt-1">{formatBytes(file.size)}</p>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3">
                <p className="text-emerald-400 uppercase tracking-wider">Sau khi nén</p>
                <p className="text-emerald-200 font-mono mt-1">{formatBytes(output.blob.size)}</p>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={output.url}
              alt="Kết quả"
              className="max-w-full max-h-96 rounded-lg border border-neutral-800 mx-auto"
            />
          </div>
        )}

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-xs text-neutral-400">
          💡 <strong className="text-neutral-300">Mẹo:</strong> chất lượng 70-80% thường là điểm
          sweet spot — file nhẹ đi đáng kể nhưng mắt thường khó nhận ra khác biệt. Dưới 50%
          có thể thấy nhiễu trên vùng trời, gradient.
        </div>
      </div>
    </ToolLayout>
  );
}
