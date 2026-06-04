"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/app/components/ToolLayout";
import ToolDropzone from "@/app/components/ToolDropzone";
import { resizeImage } from "@/app/lib/image/resize";
import { getImageDimensions, formatBytes, replaceExtension } from "@/app/lib/image/_shared";

const PERCENT_PRESETS = [75, 50, 25];

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

export default function ResizeAnhPage() {
  const [files, setFiles] = useState([]);
  const [origDim, setOrigDim] = useState(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [keepRatio, setKeepRatio] = useState(true);
  const [output, setOutput] = useState(null); // { blob, url, name }
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const file = files[0] || null;

  // Đọc dimensions khi file thay đổi
  useEffect(() => {
    if (!file) {
      setOrigDim(null);
      return;
    }
    let cancelled = false;
    setError("");
    setOutput(null);
    getImageDimensions(file)
      .then((dim) => {
        if (cancelled) return;
        setOrigDim(dim);
        setWidth(dim.width);
        setHeight(dim.height);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  // Cleanup output URL
  useEffect(() => {
    return () => {
      if (output?.url) URL.revokeObjectURL(output.url);
    };
  }, [output]);

  const handleWidthChange = (v) => {
    const w = Math.max(1, Math.min(8192, parseInt(v) || 0));
    setWidth(w);
    if (keepRatio && origDim) {
      setHeight(Math.round((w / origDim.width) * origDim.height));
    }
  };

  const handleHeightChange = (v) => {
    const h = Math.max(1, Math.min(8192, parseInt(v) || 0));
    setHeight(h);
    if (keepRatio && origDim) {
      setWidth(Math.round((h / origDim.height) * origDim.width));
    }
  };

  const applyPercent = (percent) => {
    if (!origDim) return;
    setWidth(Math.round((origDim.width * percent) / 100));
    setHeight(Math.round((origDim.height * percent) / 100));
  };

  const handleResize = async () => {
    if (!file || !width || !height) return;
    setProcessing(true);
    setError("");
    try {
      const blob = await resizeImage(file, { width, height });
      const url = URL.createObjectURL(blob);
      const name = `${width}x${height}_${file.name}`;
      setOutput({ blob, url, name });
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Resize ảnh"
      icon="📐"
      desc="Đổi kích thước ảnh JPG, PNG, WebP. Giữ tỉ lệ tự động hoặc đặt tay riêng từng chiều. Chất lượng cao nhờ Canvas API."
    >
      <div className="space-y-5">
        <ToolDropzone
          files={files}
          onChange={setFiles}
          accept="image/*"
          multiple={false}
          maxSizeMB={50}
          disabled={processing}
        />

        {file && origDim && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-4">
            <p className="text-xs text-neutral-500">
              Kích thước gốc: <span className="font-mono text-neutral-300">{origDim.width} × {origDim.height} px</span>
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="rs-w" className="block text-xs text-neutral-500 mb-1">Chiều rộng (px)</label>
                <input
                  id="rs-w"
                  type="number" min="1" max="8192"
                  value={width}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  disabled={processing}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-cyan-500/60"
                />
              </div>
              <div>
                <label htmlFor="rs-h" className="block text-xs text-neutral-500 mb-1">Chiều cao (px)</label>
                <input
                  id="rs-h"
                  type="number" min="1" max="8192"
                  value={height}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  disabled={processing}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-cyan-500/60"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={keepRatio}
                onChange={(e) => setKeepRatio(e.target.checked)}
                className="w-4 h-4 accent-cyan-500"
              />
              Giữ tỉ lệ khi đổi 1 chiều
            </label>

            <div>
              <p className="text-xs text-neutral-500 mb-2">Hoặc chọn nhanh:</p>
              <div className="flex flex-wrap gap-2">
                {PERCENT_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => applyPercent(p)}
                    disabled={processing}
                    className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-950 hover:border-cyan-500/60 text-xs text-neutral-200 transition-colors"
                  >
                    {p}% gốc
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => applyPercent(100)}
                  disabled={processing}
                  className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-950 hover:border-cyan-500/60 text-xs text-neutral-200 transition-colors"
                >
                  Về gốc 100%
                </button>
              </div>
            </div>
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
            onClick={handleResize}
            disabled={processing || !width || !height}
            className="w-full px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? "Đang xử lý..." : `Đổi sang ${width} × ${height} px`}
          </button>
        )}

        {output && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm text-emerald-300 font-medium">✓ Xong!</p>
              <button
                type="button"
                onClick={() => downloadBlob(output.blob, output.name)}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-sm font-semibold transition-colors"
              >
                ⬇ Tải xuống
              </button>
            </div>
            <p className="text-xs text-neutral-400">
              {output.name} · {formatBytes(output.blob.size)}{" "}
              <span className="text-neutral-500">
                (từ {formatBytes(file.size)} — {output.blob.size < file.size ? "↓" : "↑"}{" "}
                {Math.abs(Math.round((1 - output.blob.size / file.size) * 100))}%)
              </span>
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={output.url}
              alt="Kết quả"
              className="max-w-full max-h-96 rounded-lg border border-neutral-800 mx-auto"
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
