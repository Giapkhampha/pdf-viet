"use client";

import { useState, useCallback } from "react";
import FileDropzone from "@/app/components/FileDropzone";

// Lazy-loaded so pdfjs-dist doesn't bloat the server bundle
async function runConvert(file, options) {
  const { extractTextFromPDF } = await import("@/app/lib/pdf-extract");
  const { toMarkdown, isLikelyScan } = await import("@/app/lib/format-markdown");

  const extracted = await extractTextFromPDF(file);

  if (isLikelyScan(extracted)) {
    throw new ScanError("PDF này có vẻ là ảnh scan.");
  }

  return toMarkdown(extracted, options);
}

class ScanError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ScanError";
  }
}

function downloadMarkdown(content, originalFileName) {
  const name = originalFileName.replace(/\.pdf$/i, "") + ".md";
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ErrorBox({ message }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-4 text-sm text-red-200"
    >
      ⚠️ {message}
    </div>
  );
}

function WarnBox({ message }) {
  return (
    <div
      role="status"
      className="rounded-lg border border-amber-900 bg-amber-950/30 px-4 py-4 text-sm text-amber-200"
    >
      {message}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PdfSangMdPage() {
  const [file, setFile] = useState(null);
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [useFileName, setUseFileName] = useState(true);
  const [status, setStatus] = useState("idle"); // idle | processing | done | error | scan
  const [markdown, setMarkdown] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFiles = useCallback((files) => {
    setFile(files[0] ?? null);
    setStatus("idle");
    setMarkdown("");
    setError("");
  }, []);

  const handleConvert = async () => {
    if (!file) return;
    setStatus("processing");
    setError("");
    setMarkdown("");

    try {
      const result = await runConvert(file, {
        includePageNumbers,
        fileName: useFileName ? file.name : undefined,
      });
      setMarkdown(result);
      setStatus("done");
    } catch (err) {
      if (err.name === "ScanError") {
        setStatus("scan");
      } else {
        console.error(err);
        setError("File PDF này có vẻ bị hỏng, bạn thử file khác nhé.");
        setStatus("error");
      }
    }
  };

  const handleDownload = () => {
    if (file && markdown) downloadMarkdown(markdown, file.name);
  };

  const handleCopy = async () => {
    await copyToClipboard(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFile(null);
    setMarkdown("");
    setError("");
    setStatus("idle");
    setCopied(false);
  };

  const isProcessing = status === "processing";
  const isDone = status === "done";

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

        {/* ── Header tool ── */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-100">
              📝 PDF → Markdown
            </h1>
            <a
              href="https://giapkhampha.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-emerald-800 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-400 hover:bg-emerald-900/40 transition-colors duration-150"
              aria-label="Một phần của hệ sinh thái GIAP KHAMPHA"
            >
              🌱 Hệ sinh thái GIAP KHAMPHA
            </a>
          </div>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Chuyển PDF sang định dạng AI hiểu được — dùng với ChatGPT, Claude, Gemini.
            <br className="hidden sm:block" />
            Toàn bộ xử lý trên trình duyệt, file không rời máy bạn.
          </p>
        </div>

        <div className="space-y-6">
          {/* ── Dropzone ── */}
          <section aria-label="Chọn file PDF">
            <FileDropzone
              accept="application/pdf"
              multiple={false}
              onFiles={handleFiles}
              maxSizeMB={50}
            />
          </section>

          {/* ── Options (hiện khi có file) ── */}
          {file && !isDone && (
            <section
              aria-label="Tuỳ chọn chuyển đổi"
              className="rounded-xl border border-neutral-800 bg-neutral-900 px-5 py-4 space-y-3"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Tuỳ chọn
              </p>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={includePageNumbers}
                  onChange={(e) => setIncludePageNumbers(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
                <span className="text-sm text-neutral-300 group-hover:text-neutral-100 transition-colors">
                  Thêm số trang vào Markdown <span className="text-neutral-600">(## Trang N)</span>
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={useFileName}
                  onChange={(e) => setUseFileName(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
                <span className="text-sm text-neutral-300 group-hover:text-neutral-100 transition-colors">
                  Dùng tên file làm tiêu đề <span className="text-neutral-600">(# tên-file)</span>
                </span>
              </label>
            </section>
          )}

          {/* ── Action button ── */}
          {file && !isDone && (
            <button
              onClick={handleConvert}
              disabled={!file || isProcessing}
              aria-busy={isProcessing}
              className={[
                "w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-sm transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
                !file || isProcessing
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-400 text-neutral-950 cursor-pointer",
              ].join(" ")}
            >
              {isProcessing ? (
                <>
                  <Spinner />
                  Đang xử lý…
                </>
              ) : (
                "Chuyển sang Markdown"
              )}
            </button>
          )}

          {/* ── Error states ── */}
          {status === "error" && <ErrorBox message={error} />}
          {status === "scan" && (
            <WarnBox message="PDF này có vẻ là ảnh scan. Phiên bản hiện tại chỉ xử lý PDF có text. Tính năng OCR cho PDF scan sẽ có sớm 🌱" />
          )}

          {/* ── Result area ── */}
          {isDone && markdown && (
            <section aria-label="Kết quả Markdown" className="space-y-4">
              {/* Preview */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
                  <span className="text-xs text-neutral-500 font-mono">preview.md</span>
                  <span className="text-xs text-neutral-600">
                    {markdown.length.toLocaleString("vi-VN")} ký tự
                  </span>
                </div>
                <textarea
                  readOnly
                  value={markdown}
                  aria-label="Nội dung Markdown đã chuyển đổi"
                  className="w-full bg-transparent text-xs text-neutral-300 font-mono px-4 py-3 resize-none focus:outline-none"
                  style={{ minHeight: "220px", maxHeight: "420px" }}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-sm px-5 py-3 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                >
                  ⬇ Tải xuống .md
                </button>
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-semibold text-sm px-5 py-3 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                >
                  {copied ? "✓ Đã sao chép!" : "⧉ Sao chép"}
                </button>
              </div>

              <button
                onClick={handleReset}
                className="w-full text-sm text-neutral-500 hover:text-neutral-300 transition-colors duration-150 py-1"
              >
                ← Chuyển file khác
              </button>
            </section>
          )}

          {/* ── Footer info ── */}
          <div className="border-t border-neutral-800 pt-5 space-y-2">
            <p className="text-xs text-neutral-500">
              💡 Mẹo: file <code className="text-neutral-400">.md</code> này có thể paste thẳng vào ChatGPT, Claude hay Notion.
            </p>
            <p className="text-xs text-neutral-600">
              🔒 File của bạn được xử lý hoàn toàn trên trình duyệt — không upload lên server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
