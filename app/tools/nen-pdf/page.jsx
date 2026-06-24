"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/app/components/ToolLayout";
import ToolDropzone from "@/app/components/ToolDropzone";
import { compressPdfToTarget } from "@/app/lib/pdf-compress";
import { formatBytes } from "@/app/lib/image/_shared";

const TARGETS = [
  { mb: 3, label: "Dưới 3 MB", desc: "Gửi email, nộp cổng dịch vụ công" },
  { mb: 5, label: "Dưới 5 MB", desc: "Mức phổ biến nhất" },
  { mb: 10, label: "Dưới 10 MB", desc: "Giữ nét hơn, file lớn" },
];

function downloadBytes(bytes, filename) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export default function NenPdfPage() {
  const [files, setFiles] = useState([]);
  const [targetMb, setTargetMb] = useState(5);
  const [output, setOutput] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const file = files[0] || null;

  useEffect(() => {
    setOutput(null);
    setError("");
  }, [file, targetMb]);

  const handleCompress = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    setOutput(null);
    setProgress("Bắt đầu...");
    try {
      const targetBytes = targetMb * 1024 * 1024;
      const result = await compressPdfToTarget(file, {
        targetBytes,
        onProgress: setProgress,
      });
      setOutput({ ...result, name: `nen_${file.name}` });
    } catch (err) {
      console.error(err);
      setError(err.message || "Không nén được PDF. File có thể bị lỗi hoặc đặt mật khẩu.");
    } finally {
      setProcessing(false);
      setProgress("");
    }
  };

  const reduction =
    output && file ? Math.round((1 - output.size / file.size) * 100) : 0;
  const alreadySmall = file && file.size <= targetMb * 1024 * 1024;

  return (
    <ToolLayout
      title="Nén PDF"
      icon="🗜️"
      desc="Giảm dung lượng PDF xuống dưới mức bạn chọn (3, 5 hay 10 MB). Xử lý 100% trên trình duyệt — file không upload lên server."
    >
      <div className="space-y-5">
        <ToolDropzone
          files={files}
          onChange={setFiles}
          accept="application/pdf"
          multiple={false}
          maxSizeMB={200}
          disabled={processing}
        />

        {file && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-3">
            <p className="text-sm font-medium text-neutral-200">
              Nén xuống dưới:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TARGETS.map((t) => (
                <button
                  key={t.mb}
                  type="button"
                  onClick={() => setTargetMb(t.mb)}
                  disabled={processing}
                  className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                    targetMb === t.mb
                      ? "border-indigo-500 bg-indigo-950/40"
                      : "border-neutral-700 bg-neutral-950 hover:border-indigo-500/60"
                  }`}
                >
                  <p
                    className={`text-base font-bold ${
                      targetMb === t.mb ? "text-indigo-300" : "text-neutral-100"
                    }`}
                  >
                    {t.label}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-neutral-500">
              Dung lượng hiện tại:{" "}
              <span className="font-mono text-neutral-300">{formatBytes(file.size)}</span>
            </p>
            {alreadySmall && (
              <p className="text-xs text-amber-300 bg-amber-950/30 border border-amber-900/40 rounded-lg px-3 py-2">
                ℹ️ File đã nhỏ hơn {targetMb} MB rồi. Nén lại vẫn được nhưng có thể
                không giảm thêm nhiều — cân nhắc chọn mức thấp hơn.
              </p>
            )}
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200">
            ⚠️ {error}
          </div>
        )}

        {processing && progress && (
          <div className="flex items-center gap-3 rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-neutral-300">
            <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />
            {progress}
          </div>
        )}

        {file && (
          <button
            type="button"
            onClick={handleCompress}
            disabled={processing}
            className="w-full px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-neutral-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? "Đang nén..." : `Nén xuống dưới ${targetMb} MB →`}
          </button>
        )}

        {output && (
          <div
            className={`rounded-xl border p-4 space-y-3 ${
              output.reached
                ? "border-emerald-500/30 bg-emerald-950/20"
                : "border-amber-500/30 bg-amber-950/20"
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p
                className={`text-sm font-medium ${
                  output.reached ? "text-emerald-300" : "text-amber-300"
                }`}
              >
                {output.reached
                  ? `✓ Đã nén xuống dưới ${targetMb} MB — giảm ${reduction}%`
                  : `⚠️ Chưa đạt ${targetMb} MB. Đây là mức nhỏ nhất có thể (giảm ${reduction}%).`}
              </p>
              <button
                type="button"
                onClick={() => downloadBytes(output.bytes, output.name)}
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
                <p className="text-emerald-200 font-mono mt-1">{formatBytes(output.size)}</p>
              </div>
            </div>
            {!output.reached && (
              <p className="text-xs text-amber-200/80">
                File gốc quá nhiều trang/nội dung. Thử tách bớt trang bằng tool{" "}
                <strong>Tách PDF</strong> hoặc <strong>Xoá trang PDF</strong> rồi nén lại.
              </p>
            )}
          </div>
        )}

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-xs text-neutral-400 space-y-1">
          <p>
            💡 <strong className="text-neutral-300">Cách hoạt động:</strong> tool render
            lại từng trang thành ảnh nén ở độ nét phù hợp để đạt mục tiêu. PDF kết quả
            là dạng ảnh — đọc/in tốt nhưng <strong>không chọn-copy được chữ</strong>.
          </p>
          <p>
            Cần giữ lớp chữ để copy? Đừng nén — dùng bản gốc, hoặc tách bớt trang.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
