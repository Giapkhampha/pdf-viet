"use client";

import { useState } from "react";
import ToolLayout from "@/app/components/ToolLayout";
import { markdownToPdfViaPrint } from "@/app/lib/office/md-to-pdf";

const SAMPLE = `# Tiêu đề bài viết

Đây là **đoạn văn mẫu** trong Markdown.

## Mục 1
- Item 1
- Item 2
- Item 3

## Mục 2
1. Bước thứ nhất
2. Bước thứ hai

> Câu trích dẫn quan trọng.

\`\`\`
const x = 1;
\`\`\`

| Tên | Tuổi |
|---|---|
| An | 20 |
| Bình | 25 |`;

export default function MdSangPdfPage() {
  const [markdown, setMarkdown] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setMarkdown(await f.text());
    e.target.value = "";
  };

  const handleExport = async () => {
    if (!markdown.trim()) {
      setError("Vui lòng nhập Markdown vào ô bên dưới.");
      return;
    }
    setProcessing(true);
    setError("");
    try {
      await markdownToPdfViaPrint(markdown, "Markdown Document");
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Markdown sang PDF"
      icon="📝"
      desc="Render Markdown thành PDF qua cửa sổ in — giữ font tiếng Việt, hỗ trợ heading, bold/italic, list, code block, bảng, blockquote, link, ảnh."
    >
      <div className="space-y-5">
        <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 px-4 py-3 text-xs text-amber-200">
          💡 Sẽ mở hộp thoại <strong>In</strong>. Chọn máy in là{" "}
          <strong>&quot;Save as PDF&quot;</strong> hoặc <strong>&quot;Microsoft Print to PDF&quot;</strong>{" "}
          để lưu thành file PDF.
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="md-input" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Nội dung Markdown
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMarkdown(SAMPLE)}
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                Dùng ví dụ
              </button>
              <label className="text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer">
                Tải file .md
                <input type="file" accept=".md,.markdown,text/markdown" onChange={handleFile} className="hidden" />
              </label>
            </div>
          </div>
          <textarea
            id="md-input"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="# Tiêu đề&#10;&#10;Nội dung Markdown của bạn..."
            rows={16}
            spellCheck={false}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/60 resize-y font-mono"
          />
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200">
            ⚠️ {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleExport}
          disabled={processing || !markdown.trim()}
          className="w-full px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? "Đang chuẩn bị..." : "Mở cửa sổ in để lưu PDF →"}
        </button>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-xs text-neutral-400">
          💡 <strong className="text-neutral-300">Mẹo:</strong> tool này dùng print engine
          của trình duyệt nên PDF xuất giữ font tiếng Việt chuẩn và pagination thông minh.
          Style đã tối ưu cho A4 portrait, margin 20mm.
        </div>
      </div>
    </ToolLayout>
  );
}
