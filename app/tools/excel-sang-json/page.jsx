"use client";

import { useState } from "react";
import ToolLayout from "@/app/components/ToolLayout";
import ToolDropzone from "@/app/components/ToolDropzone";
import { xlsxToJson } from "@/app/lib/data/xlsx-to-json";
import { listSheetNames } from "@/app/lib/data/xlsx-to-csv";

function downloadText(text, name) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export default function ExcelSangJsonPage() {
  const [files, setFiles] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [pretty, setPretty] = useState(true);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);

  const file = files[0] || null;

  const handleFilesChange = async (newFiles) => {
    setFiles(newFiles);
    setError("");
    setOutput("");
    const f = newFiles[0];
    if (!f) {
      setSheets([]);
      setSelectedSheet("");
      return;
    }
    try {
      const names = await listSheetNames(f);
      setSheets(names);
      setSelectedSheet(names[0] || "");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    try {
      const json = await xlsxToJson(file, { sheet: selectedSheet, pretty });
      setOutput(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const name = file.name.replace(/\.(xlsx|xls)$/i, "") + ".json";
    downloadText(output, name);
  };

  return (
    <ToolLayout
      title="Excel sang JSON"
      icon="🔗"
      desc="Chuyển bảng tính Excel sang JSON — row 1 thành key, mỗi row thành 1 object. Phù hợp cho dev cần import data vào API, database."
    >
      <div className="space-y-5">
        <ToolDropzone
          files={files}
          onChange={handleFilesChange}
          accept=".xlsx,.xls"
          multiple={false}
          maxSizeMB={50}
          disabled={processing}
        />

        {file && sheets.length > 0 && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-3">
            <div>
              <label htmlFor="sheet-pick" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                Sheet ({sheets.length})
              </label>
              <select
                id="sheet-pick"
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500/60"
              >
                {sheets.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={pretty}
                onChange={(e) => setPretty(e.target.checked)}
                className="w-4 h-4 accent-emerald-500"
              />
              Pretty print (xuống dòng, dễ đọc)
            </label>
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
            className="w-full px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? "Đang xử lý..." : "Chuyển sang JSON →"}
          </button>
        )}

        {output && (
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Kết quả ({output.length.toLocaleString("vi-VN")} ký tự)
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-md border border-neutral-700 text-xs text-neutral-200 hover:border-neutral-500 transition-colors"
                >
                  {copied ? "✓ Đã chép!" : "⧉ Sao chép"}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-semibold transition-colors"
                >
                  ⬇ Tải .json
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={output}
              rows={14}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-xs text-neutral-200 font-mono resize-y focus:outline-none"
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
