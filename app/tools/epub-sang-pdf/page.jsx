"use client";

import { useState } from "react";
import ToolLayout from "@/app/components/ToolLayout";
import ToolDropzone from "@/app/components/ToolDropzone";
import { epubToPdfViaPrint } from "@/app/lib/ebook/epub-to-pdf";

export default function EpubSangPdfPage() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | processing | done | error
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const file = files[0] || null;
  const isProcessing = status === "processing";

  const handleExport = async () => {
    if (!file) return;
    setStatus("processing");
    setProgress("Đang mở file EPUB...");
    setError("");
    try {
      await epubToPdfViaPrint(file, (msg) => setProgress(msg));
      setStatus("done");
      setProgress("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Không đọc được file EPUB này, bạn thử file khác nhé.");
      setStatus("error");
      setProgress("");
    }
  };

  return (
    <ToolLayout
      title="EPUB sang PDF"
      icon="📚"
      desc="Chuyển sách điện tử .epub (đã gỡ DRM) thành PDF để đọc, in hoặc lưu trữ. Giữ font tiếng Việt, ảnh minh hoạ và trang bìa — mọi thứ xử lý ngay trên trình duyệt."
    >
      <div className="space-y-5">
        <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 px-4 py-3 text-xs text-amber-200">
          💡 Sẽ mở hộp thoại <strong>In</strong>. Chọn máy in là{" "}
          <strong>&quot;Save as PDF&quot;</strong> hoặc{" "}
          <strong>&quot;Microsoft Print to PDF&quot;</strong> để lưu thành file PDF.
        </div>

        <ToolDropzone
          files={files}
          onChange={setFiles}
          accept=".epub,application/epub+zip"
          multiple={false}
          maxSizeMB={200}
          disabled={isProcessing}
        />

        {status === "processing" && progress && (
          <div className="flex items-center gap-3 rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-neutral-300">
            <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />
            {progress}
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200">
            ⚠️ {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleExport}
          disabled={!file || isProcessing}
          className="w-full px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing
            ? "Đang chuyển đổi..."
            : status === "done"
            ? "✓ Mở lại cửa sổ in"
            : "Mở cửa sổ in để lưu PDF →"}
        </button>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-xs text-neutral-400 space-y-2">
          <p>
            💡 <strong className="text-neutral-300">Chuyển cả kho sách Kindle:</strong> Kindle
            dùng định dạng riêng (AZW/KFX). Hãy dùng Calibre để đưa sách về{" "}
            <strong>.epub</strong> trước (nhớ gỡ DRM với sách bạn sở hữu), rồi thả từng file
            vào đây. Mỗi lần một cuốn để trình duyệt xử lý mượt.
          </p>
          <p>
            📖 Tool dùng print engine của trình duyệt nên PDF giữ font tiếng Việt chuẩn, ngắt
            trang thông minh, mỗi chương một trang mới. CSS gốc của EPUB được thay bằng kiểu
            sách sạch, tối ưu khổ A4.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
