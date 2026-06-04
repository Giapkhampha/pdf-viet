"use client";

import { useState } from "react";
import ToolLayout from "@/app/components/ToolLayout";
import ToolDropzone from "@/app/components/ToolDropzone";
import { wordToMarkdown } from "@/app/lib/office/word-to-md";

function downloadText(text, name) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export default function WordSangMdPage() {
  const [files, setFiles] = useState([]);
  const [markdown, setMarkdown] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const file = files[0] || null;

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    setMarkdown("");
    setWarnings([]);
    try {
      const result = await wordToMarkdown(file);
      setMarkdown(result.markdown);
      setWarnings(result.warnings);
    } catch (err) {
      setError(err.message || "Không đọc được file Word.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const name = file.name.replace(/\.(docx|doc)$/i, "") + ".md";
    downloadText(markdown, name);
  };

  return (
    <ToolLayout
      title="Word sang Markdown"
      icon="📝"
      desc="Chuyển file .docx thành Markdown để paste vào ChatGPT, Claude, Notion, hoặc lưu vào git. Giữ heading, bold/italic, list, link, bảng."
    >
      <div className="space-y-5">
        <ToolDropzone
          files={files}
          onChange={setFiles}
          accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          multiple={false}
          maxSizeMB={50}
          disabled={processing}
        />

        {error && (
          <div role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200">
            ⚠️ {error}
          </div>
        )}

        {file && !markdown && (
          <button
            type="button"
            onClick={handleConvert}
            disabled={processing}
            className="w-full px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? "Đang chuyển..." : "Chuyển sang Markdown →"}
          </button>
        )}

        {markdown && (
          <>
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
                <span className="text-xs text-neutral-500 font-mono">preview.md</span>
                <span className="text-xs text-neutral-600">{markdown.length.toLocaleString("vi-VN")} ký tự</span>
              </div>
              <textarea
                readOnly
                value={markdown}
                rows={14}
                className="w-full bg-transparent text-xs text-neutral-200 font-mono px-4 py-3 resize-y focus:outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold transition-colors"
              >
                ⬇ Tải xuống .md
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 px-5 py-3 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-100 font-medium transition-colors"
              >
                {copied ? "✓ Đã sao chép!" : "⧉ Sao chép"}
              </button>
            </div>

            {warnings.length > 0 && (
              <details className="rounded-xl border border-amber-900/40 bg-amber-950/20 px-4 py-3">
                <summary className="text-sm text-amber-200 cursor-pointer">
                  ⚠️ {warnings.length} cảnh báo từ thư viện chuyển đổi
                </summary>
                <ul className="mt-2 space-y-1 text-xs text-amber-300/80 list-disc list-inside">
                  {warnings.slice(0, 10).map((w, i) => (
                    <li key={i}>{w.message}</li>
                  ))}
                </ul>
              </details>
            )}
          </>
        )}

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-xs text-neutral-400">
          💡 <strong className="text-neutral-300">Mẹo:</strong> file Markdown này paste thẳng
          vào ChatGPT/Claude/Gemini sẽ giữ được cấu trúc heading, list, table — AI hiểu rõ
          hơn so với paste plain text.
        </div>
      </div>
    </ToolLayout>
  );
}
