"use client";

import { useState } from "react";
import ToolLayout from "@/app/components/ToolLayout";
import ToolDropzone from "@/app/components/ToolDropzone";
import { csvToXlsx } from "@/app/lib/data/csv-to-xlsx";

function downloadBytes(bytes, name, mime) {
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export default function CsvSangExcelPage() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const file = files[0] || null;

  const handleConvert = async () => {
    if (!file) return;
    setStatus("processing");
    setError("");
    try {
      const bytes = await csvToXlsx(file);
      const name = file.name.replace(/\.csv$/i, "") + ".xlsx";
      downloadBytes(
        bytes,
        name,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      setStatus("done");
    } catch (err) {
      setError(err.message || "Không đọc được file CSV.");
      setStatus("error");
    }
  };

  return (
    <ToolLayout
      title="CSV sang Excel"
      icon="📊"
      desc="Chuyển file .csv thành .xlsx — giữ nguyên dữ liệu, hỗ trợ UTF-8 + tiếng Việt có dấu. Phù hợp với file CSV xuất từ Google Sheets, Notion."
    >
      <div className="space-y-5">
        <ToolDropzone
          files={files}
          onChange={setFiles}
          accept=".csv,text/csv"
          multiple={false}
          maxSizeMB={50}
          disabled={status === "processing"}
        />

        {error && (
          <div role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200">
            ⚠️ {error}
          </div>
        )}

        {file && (
          <button
            type="button"
            onClick={handleConvert}
            disabled={status === "processing"}
            className="w-full px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === "processing" ? "Đang xử lý..." : status === "done" ? "✓ Xong! Convert lại?" : "Chuyển sang Excel →"}
          </button>
        )}

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-xs text-neutral-400">
          💡 <strong className="text-neutral-300">Mẹo:</strong> nếu file CSV mở trong Excel bị
          lỗi tiếng Việt, kiểm tra file CSV có dấu BOM UTF-8 ở đầu không. Tool này giữ
          nguyên encoding khi chuyển sang Excel.
        </div>
      </div>
    </ToolLayout>
  );
}
