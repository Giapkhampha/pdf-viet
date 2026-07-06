"use client";

import { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/app/components/ToolLayout";
import ToolDropzone from "@/app/components/ToolDropzone";
import { analyzePdf } from "@/app/lib/pdf-analyze";
import { formatReadingTime } from "@/app/lib/vietnamese/count-chars";

function StatBox({ label, value, sub, accent = "neutral" }) {
  const accents = {
    cyan:    "border-cyan-500/30    bg-cyan-950/20    text-cyan-300",
    amber:   "border-amber-500/30   bg-amber-950/20   text-amber-300",
    violet:  "border-violet-500/30  bg-violet-950/20  text-violet-300",
    emerald: "border-emerald-500/30 bg-emerald-950/20 text-emerald-300",
    pink:    "border-pink-500/30    bg-pink-950/20    text-pink-300",
    neutral: "border-neutral-800    bg-neutral-900    text-neutral-100",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 ${accents[accent]}`}>
      <p className="text-xs uppercase tracking-wider opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function PhanTichPdfPage() {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const [processing, setProcessing] = useState(false);

  const file = files[0] || null;

  const handleAnalyze = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    setResult(null);
    setProgress("Bắt đầu...");
    try {
      const r = await analyzePdf(file, setProgress);
      setResult(r);
    } catch (err) {
      setError(err.message || "Không phân tích được PDF.");
    } finally {
      setProcessing(false);
      setProgress("");
    }
  };

  return (
    <ToolLayout
      title="Phân tích PDF"
      icon="🔍"
      desc="Đếm trang, ký tự, từ, câu, đoạn của file PDF. Ước lượng thời gian đọc, liệt kê top từ phổ biến nhất. Hỗ trợ tiếng Việt có dấu — đã loại stopwords."
    >
      <div className="space-y-5">
        <ToolDropzone
          files={files}
          onChange={(f) => { setFiles(f); setResult(null); setError(""); }}
          accept="application/pdf"
          multiple={false}
          maxSizeMB={100}
          disabled={processing}
        />

        {file && !result && (
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={processing}
            className="w-full px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? `Đang phân tích... ${progress || ""}` : "Phân tích PDF →"}
          </button>
        )}

        {error && (
          <div role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200">
            ⚠️ {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {result.isLikelyScan && (
              <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">
                ⚠️ PDF này có vẻ là <strong>ảnh scan</strong> (rất ít text layer). Kết quả phân
                tích có thể không chính xác. Dùng tool{" "}
                <Link href="/tools/ocr-tieng-viet" className="underline">OCR tiếng Việt</Link>{" "}
                để trích xuất text trước.
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatBox label="Số trang" value={result.pageCount} accent="cyan" />
              <StatBox label="Từ" value={result.stats.words.toLocaleString("vi-VN")} accent="amber" />
              <StatBox label="Ký tự" value={result.stats.chars.toLocaleString("vi-VN")} sub={`Không space: ${result.stats.charsNoSpace.toLocaleString("vi-VN")}`} accent="emerald" />
              <StatBox label="Câu" value={result.stats.sentences.toLocaleString("vi-VN")} accent="violet" />
              <StatBox label="Đoạn" value={result.stats.paragraphs.toLocaleString("vi-VN")} accent="pink" />
              <StatBox
                label="Thời gian đọc"
                value={formatReadingTime(result.stats.readingSeconds)}
                sub="200 từ/phút"
                accent="cyan"
              />
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Trung bình mỗi trang
              </p>
              <p className="text-sm text-neutral-300">
                <span className="font-mono text-amber-300">
                  {Math.round(result.stats.words / result.pageCount).toLocaleString("vi-VN")}
                </span> từ ·{" "}
                <span className="font-mono text-amber-300">
                  {Math.round(result.stats.chars / result.pageCount).toLocaleString("vi-VN")}
                </span> ký tự
              </p>
            </div>

            {result.topWords.length > 0 && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                  Top 20 từ phổ biến nhất (đã loại stopwords)
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.topWords.map(([word, count]) => (
                    <span
                      key={word}
                      className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5"
                    >
                      <span className="text-sm font-medium text-neutral-100">{word}</span>
                      <span className="text-xs text-amber-400 font-mono">×{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-xs text-neutral-400">
          💡 <strong className="text-neutral-300">Khi nào dùng?</strong> Trước khi paste PDF
          vào ChatGPT/Claude để biết tài liệu có vừa context không. Tốc độ đọc 200 từ/phút
          là chuẩn cho ba mẹ Việt đọc tài liệu kỹ.
        </div>
      </div>
    </ToolLayout>
  );
}
