"use client";

import { useState, use } from "react";
import Link from "next/link";
import ToolLayout from "@/app/components/ToolLayout";
import ToolDropzone from "@/app/components/ToolDropzone";
import SignaturePad from "@/app/components/SignaturePad";
import { getToolBySlug } from "@/app/lib/tools-registry";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function triggerDownload(bytes, filename, mime = "application/pdf") {
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function replaceExt(name, newExt) {
  return name.replace(/\.[^.]+$/, "") + newExt;
}

// Map handler key → async function (file(s), opts, onProgress) => result
async function runHandler(handlerKey, files, opts, onProgress) {
  switch (handlerKey) {
    case "splitPdf": {
      const { splitPdfPerPage } = await import("@/app/lib/pdf-split");
      const parts = await splitPdfPerPage(files[0]);
      for (const p of parts) {
        triggerDownload(p.bytes, p.name);
        await new Promise((r) => setTimeout(r, 300));
      }
      return { kind: "multi", count: parts.length };
    }
    case "compressPdf": {
      const { compressPdf } = await import("@/app/lib/pdf-compress");
      const bytes = await compressPdf(files[0]);
      triggerDownload(bytes, `nen_${files[0].name}`);
      return { kind: "single" };
    }
    case "rotatePdf": {
      const { rotatePdf } = await import("@/app/lib/pdf-rotate");
      const bytes = await rotatePdf(files[0], opts.rotate);
      triggerDownload(bytes, `xoay_${files[0].name}`);
      return { kind: "single" };
    }
    case "watermarkPdf": {
      const { watermarkPdf } = await import("@/app/lib/pdf-watermark");
      const bytes = await watermarkPdf(files[0], opts.watermark || "BẢO MẬT");
      triggerDownload(bytes, `watermark_${files[0].name}`);
      return { kind: "single" };
    }
    case "pageNumbers": {
      const { addPageNumbers } = await import("@/app/lib/pdf-page-numbers");
      const bytes = await addPageNumbers(files[0]);
      triggerDownload(bytes, `so-trang_${files[0].name}`);
      return { kind: "single" };
    }
    case "deletePages": {
      const { deletePages } = await import("@/app/lib/pdf-pages-edit");
      const bytes = await deletePages(files[0], opts.pageInput);
      triggerDownload(bytes, `da-xoa-trang_${files[0].name}`);
      return { kind: "single" };
    }
    case "extractPages": {
      const { extractPages } = await import("@/app/lib/pdf-pages-edit");
      const bytes = await extractPages(files[0], opts.pageInput);
      triggerDownload(bytes, `trang-trich_${files[0].name}`);
      return { kind: "single" };
    }
    case "signPdf": {
      const { signPdf } = await import("@/app/lib/pdf-sign");
      const bytes = await signPdf(files[0], opts.signature);
      triggerDownload(bytes, `da-ky_${files[0].name}`);
      return { kind: "single" };
    }
    case "flattenPdf": {
      const { flattenPdf } = await import("@/app/lib/pdf-flatten");
      const bytes = await flattenPdf(files[0]);
      triggerDownload(bytes, `lam-phang_${files[0].name}`);
      return { kind: "single" };
    }
    case "imagesToPdf": {
      const { imagesToPdf } = await import("@/app/lib/images-to-pdf");
      const bytes = await imagesToPdf(files);
      triggerDownload(bytes, "anh-ghep.pdf");
      return { kind: "single" };
    }
    case "pdfToImages": {
      const { pdfToImages } = await import("@/app/lib/pdf-to-images");
      const parts = await pdfToImages(files[0], onProgress);
      for (const p of parts) {
        triggerDownload(p.bytes, p.name, "image/jpeg");
        await new Promise((r) => setTimeout(r, 300));
      }
      return { kind: "multi", count: parts.length };
    }
    case "pdfToDocx": {
      const { pdfToDocx } = await import("@/app/lib/pdf-to-docx");
      const bytes = await pdfToDocx(files[0], onProgress);
      triggerDownload(
        bytes,
        replaceExt(files[0].name, ".docx"),
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      return { kind: "single" };
    }
    case "pdfToXlsx": {
      const { pdfToXlsx } = await import("@/app/lib/pdf-to-xlsx");
      const bytes = await pdfToXlsx(files[0], onProgress);
      triggerDownload(
        bytes,
        replaceExt(files[0].name, ".xlsx"),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      return { kind: "single" };
    }
    case "wordToPdf": {
      const { wordToPdfViaPrint } = await import("@/app/lib/word-to-pdf");
      await wordToPdfViaPrint(files[0], onProgress);
      return { kind: "print" };
    }
    case "excelToPdf": {
      const { excelToPdfViaPrint } = await import("@/app/lib/excel-to-pdf");
      await excelToPdfViaPrint(files[0], onProgress);
      return { kind: "print" };
    }
    case "htmlToPdf": {
      const { htmlToPdfViaPrint } = await import("@/app/lib/html-to-pdf");
      await htmlToPdfViaPrint(files[0], onProgress);
      return { kind: "print" };
    }
    case "ocr": {
      const { ocrImage } = await import("@/app/lib/ocr");
      const text = await ocrImage(files[0], onProgress);
      triggerDownload(
        new TextEncoder().encode(text),
        replaceExt(files[0].name, "_ocr.txt"),
        "text/plain;charset=utf-8"
      );
      return { kind: "text", text };
    }
    default:
      throw new Error("Công cụ này chưa được kết nối.");
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function NotFoundView() {
  return (
    <ToolLayout title="Không tìm thấy công cụ" icon="🤔">
      <p className="text-neutral-400">
        Có thể đường dẫn đã thay đổi. Quay về{" "}
        <Link href="/" className="text-emerald-400 hover:text-emerald-300 underline">
          trang chủ
        </Link>{" "}
        để xem danh sách công cụ hiện có.
      </p>
    </ToolLayout>
  );
}

function ComingSoonView({ tool }) {
  return (
    <ToolLayout title={tool.title} desc={tool.desc} icon={tool.icon}>
      <div className="rounded-xl border border-amber-900 bg-amber-950/30 px-5 py-6 text-center">
        <p className="text-3xl mb-3" aria-hidden="true">🚧</p>
        <p className="text-amber-200 font-medium mb-2">Công cụ này đang được xây dựng</p>
        <p className="text-amber-300/70 text-sm">
          Đã có trong roadmap. Theo dõi{" "}
          <a
            href="https://giapkhampha.me"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-200"
          >
            GIAP KHAMPHA
          </a>{" "}
          để biết khi nào lên sóng.
        </p>
      </div>
    </ToolLayout>
  );
}

function NoteBox({ kind }) {
  if (kind === "print") {
    return (
      <div className="rounded-lg border border-amber-900 bg-amber-950/30 px-4 py-3 text-xs text-amber-200">
        💡 Sẽ mở hộp thoại <strong>In</strong>. Chọn máy in là{" "}
        <strong>&quot;Save as PDF&quot;</strong> để lưu thành file PDF.
      </div>
    );
  }
  if (kind === "ocr") {
    return (
      <div className="rounded-lg border border-amber-900 bg-amber-950/30 px-4 py-3 text-xs text-amber-200">
        ⚠️ Lần đầu cần tải ~20MB model OCR. Hỗ trợ tiếng Việt — ảnh càng rõ kết quả càng tốt.
      </div>
    );
  }
  return null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ToolBySlugPage({ params }) {
  const { slug } = use(params);
  const tool = getToolBySlug(slug);

  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | processing | done | error
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [resultText, setResultText] = useState("");

  // Option states
  const [rotateDeg, setRotateDeg] = useState(90);
  const [watermarkText, setWatermarkText] = useState("BẢO MẬT");
  const [pageInput, setPageInput] = useState("");
  const [signature, setSignature] = useState(null);

  if (!tool) return <NotFoundView />;
  if (tool.status !== "ready") return <ComingSoonView tool={tool} />;

  const opts = new Set(tool.options || []);

  const handleProcess = async () => {
    if (files.length === 0) return;
    if (opts.has("signature") && !signature) {
      setError("Vui lòng vẽ chữ ký trước khi xử lý.");
      setStatus("error");
      return;
    }
    setStatus("processing");
    setProgress("Đang xử lý...");
    setError("");
    setResultText("");
    try {
      const result = await runHandler(
        tool.handler,
        files,
        { rotate: rotateDeg, watermark: watermarkText, pageInput, signature },
        (msg) => setProgress(msg)
      );
      if (result.kind === "text") setResultText(result.text);
      setStatus("done");
      setProgress("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Có lỗi xảy ra, bạn thử lại nhé.");
      setStatus("error");
      setProgress("");
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStatus("idle");
    setError("");
    setProgress("");
    setResultText("");
    setSignature(null);
    setPageInput("");
  };

  const isProcessing = status === "processing";
  const canProcess = files.length > 0 && !isProcessing;
  const buttonLabel = (() => {
    if (isProcessing) return "Đang xử lý...";
    if (status === "done") return tool.note === "print" ? "✓ Mở lại cửa sổ in" : "✓ Xong! Chạy lại?";
    if (tool.note === "print") return "Mở cửa sổ in →";
    return "Xử lý ngay →";
  })();

  return (
    <ToolLayout title={tool.title} desc={tool.desc} icon={tool.icon}>
      <div className="space-y-5">
        <NoteBox kind={tool.note} />

        <ToolDropzone
          files={files}
          onChange={setFiles}
          accept={tool.accept}
          multiple={tool.multiple}
          disabled={isProcessing}
        />

        {/* ── Options ── */}
        {files.length > 0 && opts.has("rotate") && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <label className="block text-sm font-medium text-neutral-200 mb-3">
              Góc xoay
            </label>
            <div className="flex gap-2">
              {[90, 180, 270].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setRotateDeg(d)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    rotateDeg === d
                      ? "bg-emerald-500 text-neutral-950 border-emerald-500"
                      : "border-neutral-700 text-neutral-300 hover:border-emerald-500/60"
                  }`}
                >
                  {d}°
                </button>
              ))}
            </div>
          </div>
        )}

        {files.length > 0 && opts.has("watermark") && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <label
              htmlFor="watermark-text"
              className="block text-sm font-medium text-neutral-200 mb-2"
            >
              Nội dung watermark
            </label>
            <input
              id="watermark-text"
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="Ví dụ: BẢO MẬT, NHÁP, MẪU..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/60"
            />
            <p className="text-xs text-neutral-500 mt-1">
              ⚠️ Hiện chỉ hỗ trợ chữ không dấu (font Helvetica). Hỗ trợ tiếng Việt sẽ có ở phiên bản sau.
            </p>
          </div>
        )}

        {files.length > 0 && opts.has("pageInput") && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <label
              htmlFor="page-input"
              className="block text-sm font-medium text-neutral-200 mb-2"
            >
              Trang cần xử lý
            </label>
            <input
              id="page-input"
              type="text"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              placeholder="Ví dụ: 1, 3, 5-7"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/60"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Phân cách bằng dấu phẩy. Dải trang dùng dấu gạch nối: 5-10.
            </p>
          </div>
        )}

        {files.length > 0 && opts.has("signature") && (
          !signature ? (
            <SignaturePad onSave={(url) => setSignature(url)} />
          ) : (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
              <p className="text-sm font-medium text-neutral-200 mb-2">Chữ ký đã chọn:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={signature}
                alt="Chữ ký"
                className="h-16 border border-neutral-800 rounded-lg bg-neutral-950 p-2"
              />
              <button
                type="button"
                onClick={() => setSignature(null)}
                className="mt-2 text-xs text-red-400 hover:text-red-300"
              >
                Vẽ lại
              </button>
            </div>
          )
        )}

        {/* ── Status ── */}
        {status === "processing" && progress && (
          <div className="flex items-center gap-3 rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-neutral-300">
            <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />
            {progress}
          </div>
        )}

        {status === "error" && error && (
          <div
            role="alert"
            className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200"
          >
            ⚠️ {error}
          </div>
        )}

        {resultText && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
              <span className="text-xs text-neutral-500 font-mono">ocr-result.txt</span>
              <span className="text-xs text-neutral-600">
                {resultText.length.toLocaleString("vi-VN")} ký tự
              </span>
            </div>
            <textarea
              readOnly
              value={resultText}
              aria-label="Nội dung OCR"
              className="w-full bg-transparent text-xs text-neutral-200 font-mono px-4 py-3 resize-none focus:outline-none"
              style={{ minHeight: "220px", maxHeight: "420px" }}
            />
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleProcess}
            disabled={!canProcess}
            className="flex-1 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 transition-colors"
          >
            {buttonLabel}
          </button>
          {files.length > 0 && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isProcessing}
              className="px-6 py-3 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-medium disabled:opacity-50"
            >
              Bắt đầu lại
            </button>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
