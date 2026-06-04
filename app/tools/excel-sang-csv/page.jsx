"use client";

import { useState } from "react";
import ToolLayout from "@/app/components/ToolLayout";
import ToolDropzone from "@/app/components/ToolDropzone";
import { xlsxToCsv, listSheetNames } from "@/app/lib/data/xlsx-to-csv";

function downloadText(text, name) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export default function ExcelSangCsvPage() {
  const [files, setFiles] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const file = files[0] || null;

  // Gộp set files + load sheets vào 1 handler để tránh setState-in-effect
  const handleFilesChange = async (newFiles) => {
    setFiles(newFiles);
    setError("");
    setStatus("idle");
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

  const handleConvert = async (allSheets = false) => {
    if (!file) return;
    setStatus("processing");
    setError("");
    try {
      const targets = allSheets ? sheets : [selectedSheet];
      for (const sheet of targets) {
        const csv = await xlsxToCsv(file, sheet);
        const base = file.name.replace(/\.(xlsx|xls)$/i, "");
        const name = targets.length > 1 ? `${base}_${sheet}.csv` : `${base}.csv`;
        downloadText(csv, name);
        if (targets.length > 1) await new Promise((r) => setTimeout(r, 300));
      }
      setStatus("done");
    } catch (err) {
      setError(err.message || "Không đọc được file Excel.");
      setStatus("error");
    }
  };

  return (
    <ToolLayout
      title="Excel sang CSV"
      icon="📊"
      desc="Chuyển .xlsx, .xls thành .csv (UTF-8 với BOM, mở trong Excel/Google Sheets không lỗi tiếng Việt). Hỗ trợ file nhiều sheet — chọn 1 sheet hoặc export tất cả."
    >
      <div className="space-y-5">
        <ToolDropzone
          files={files}
          onChange={handleFilesChange}
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          multiple={false}
          maxSizeMB={50}
          disabled={status === "processing"}
        />

        {file && sheets.length > 0 && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <label htmlFor="sheet-pick" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
              Sheet xuất ({sheets.length} sheet)
            </label>
            <select
              id="sheet-pick"
              value={selectedSheet}
              onChange={(e) => setSelectedSheet(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500/60"
            >
              {sheets.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200">
            ⚠️ {error}
          </div>
        )}

        {file && sheets.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => handleConvert(false)}
              disabled={status === "processing"}
              className="flex-1 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === "processing" ? "Đang xử lý..." : `Xuất sheet "${selectedSheet}" sang CSV`}
            </button>
            {sheets.length > 1 && (
              <button
                type="button"
                onClick={() => handleConvert(true)}
                disabled={status === "processing"}
                className="px-5 py-3 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-medium disabled:opacity-50"
              >
                Xuất tất cả {sheets.length} sheet
              </button>
            )}
          </div>
        )}

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-xs text-neutral-400">
          💡 File CSV xuất có BOM UTF-8 nên mở thẳng trong Excel sẽ hiển thị tiếng Việt đúng.
        </div>
      </div>
    </ToolLayout>
  );
}
