"use client";

import { useState, useRef, useCallback } from "react";
import { mergePdfs, countPdfPages } from "@/app/lib/pdf-merge";
import { parsePageRanges } from "@/app/lib/parse-page-ranges";
import ToolLayout from "@/app/components/ToolLayout";

const MAX_FILE_SIZE_MB = 100;

export default function GhepPdfPage() {
  const [items, setItems] = useState([]); // {id, file, pageCount, rangeInput, error}
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [globalError, setGlobalError] = useState("");
  const dragIndex = useRef(null);
  const dragOverIndex = useRef(null);
  const inputRef = useRef(null);

  const handleFiles = useCallback(async (files) => {
    setGlobalError("");
    setResultUrl(null);

    const newItems = [];
    for (const file of files) {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setGlobalError(`File "${file.name}" không phải PDF, bạn nhé.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setGlobalError(
          `File "${file.name}" lớn hơn ${MAX_FILE_SIZE_MB}MB, có thể xử lý chậm. Bạn thử nén bớt nhé.`
        );
      }
      const id = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`;
      newItems.push({ id, file, pageCount: null, rangeInput: "", error: "" });
    }

    if (newItems.length === 0) return;
    setItems((prev) => [...prev, ...newItems]);

    for (const item of newItems) {
      countPdfPages(item.file).then((count) => {
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, pageCount: count } : it))
        );
      });
    }
  }, []);

  const onInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    e.target.value = "";
  };

  const onDropFiles = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files || []);
    handleFiles(files);
  };

  const moveItem = (from, to) => {
    if (to < 0 || to >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateRange = (id, value) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, rangeInput: value, error: "" } : it))
    );
  };

  const onItemDragStart = (idx) => () => {
    dragIndex.current = idx;
  };
  const onItemDragOver = (idx) => (e) => {
    e.preventDefault();
    dragOverIndex.current = idx;
  };
  const onItemDrop = () => {
    const from = dragIndex.current;
    const to = dragOverIndex.current;
    if (from != null && to != null && from !== to) {
      moveItem(from, to);
    }
    dragIndex.current = null;
    dragOverIndex.current = null;
  };

  const handleMerge = async () => {
    if (items.length === 0) return;
    setGlobalError("");
    setResultUrl(null);
    setIsProcessing(true);

    try {
      const prepared = [];
      const itemsWithErrors = [];
      for (const it of items) {
        let pageRanges = null;
        try {
          if (it.pageCount == null) {
            const c = await countPdfPages(it.file);
            it.pageCount = c;
          }
          pageRanges = parsePageRanges(it.rangeInput, it.pageCount);
        } catch (err) {
          itemsWithErrors.push({ id: it.id, error: err.message });
          continue;
        }
        prepared.push({ file: it.file, pageRanges });
      }

      if (itemsWithErrors.length > 0) {
        setItems((prev) =>
          prev.map((it) => {
            const found = itemsWithErrors.find((e) => e.id === it.id);
            return found ? { ...it, error: found.error } : { ...it, error: "" };
          })
        );
        throw new Error("Vui lòng kiểm tra lại phạm vi trang ở các file được đánh dấu đỏ.");
      }

      const bytes = await mergePdfs(prepared, (p) => setProgress(p));
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      console.error(err);
      setGlobalError(err.message || "Có lỗi không mong muốn xảy ra. Bạn thử lại nhé.");
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setItems([]);
    setResultUrl(null);
    setGlobalError("");
    setProgress(null);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <ToolLayout
      title="Ghép PDF"
      icon="🧩"
      desc="Ghép nhiều file PDF thành 1 file duy nhất. Bạn có thể chọn trang cụ thể của từng file (ví dụ: chỉ lấy trang 1-3 của file A và toàn bộ file B)."
    >
      <div className="max-w-3xl">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={onDropFiles}
          className="border-2 border-dashed border-neutral-800 hover:border-emerald-500/50 rounded-xl p-8 text-center transition-colors bg-neutral-900/50"
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            multiple
            onChange={onInputChange}
            className="sr-only"
            id="pdf-file-input"
          />
          <label
            htmlFor="pdf-file-input"
            className="cursor-pointer inline-flex flex-col items-center gap-3"
          >
            <span className="text-5xl" aria-hidden="true">📄</span>
            <span className="text-lg font-medium text-neutral-100">
              Kéo & thả file PDF vào đây
            </span>
            <span className="text-sm text-neutral-400">
              hoặc <span className="text-emerald-400 underline">bấm để chọn file</span>
            </span>
            <span className="text-xs text-neutral-500 mt-2">
              Chọn nhiều file cùng lúc · Tối đa khuyến nghị {MAX_FILE_SIZE_MB}MB/file
            </span>
          </label>
        </div>

        {globalError && (
          <div
            role="alert"
            className="mt-4 px-4 py-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-300 text-sm"
          >
            {globalError}
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-100">
                Danh sách file ({items.length})
              </h2>
              <span className="text-xs text-neutral-500">
                Kéo thả hoặc dùng nút ↑↓ để sắp xếp
              </span>
            </div>

            <ul className="space-y-3">
              {items.map((item, idx) => (
                <li
                  key={item.id}
                  draggable={!isProcessing}
                  onDragStart={onItemDragStart(idx)}
                  onDragOver={onItemDragOver(idx)}
                  onDrop={onItemDrop}
                  className={`bg-neutral-900 border rounded-lg p-4 transition-colors ${
                    item.error
                      ? "border-red-900/60"
                      : "border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="cursor-grab active:cursor-grabbing text-neutral-500 hover:text-neutral-300 pt-1 select-none"
                      aria-hidden="true"
                      title="Kéo để sắp xếp"
                    >
                      ⠿
                    </div>

                    <div className="shrink-0 w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-semibold flex items-center justify-center">
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-neutral-100 truncate">
                        {item.file.name}
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        {formatSize(item.file.size)}
                        {item.pageCount != null && (
                          <span> · {item.pageCount} trang</span>
                        )}
                      </div>

                      <div className="mt-3">
                        <label
                          htmlFor={`range-${item.id}`}
                          className="block text-xs text-neutral-400 mb-1"
                        >
                          Trang muốn lấy (để trống = tất cả)
                        </label>
                        <input
                          id={`range-${item.id}`}
                          type="text"
                          value={item.rangeInput}
                          onChange={(e) => updateRange(item.id, e.target.value)}
                          placeholder="Ví dụ: 1-3, 5, 7-10"
                          disabled={isProcessing}
                          className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus:border-emerald-500/50 disabled:opacity-50"
                        />
                        {item.error && (
                          <p className="text-xs text-red-400 mt-1">{item.error}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveItem(idx, idx - 1)}
                        disabled={idx === 0 || isProcessing}
                        aria-label={`Di chuyển ${item.file.name} lên trên`}
                        className="w-8 h-8 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(idx, idx + 1)}
                        disabled={idx === items.length - 1 || isProcessing}
                        aria-label={`Di chuyển ${item.file.name} xuống dưới`}
                        className="w-8 h-8 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={isProcessing}
                        aria-label={`Xoá ${item.file.name}`}
                        className="w-8 h-8 rounded-md bg-neutral-800 hover:bg-red-900/40 hover:text-red-300 text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleMerge}
                disabled={isProcessing || items.length === 0}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 transition-colors"
              >
                {isProcessing ? "Đang ghép..." : `Ghép ${items.length} file thành 1 PDF`}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isProcessing}
                className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-medium rounded-lg disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 transition-colors"
              >
                Xoá hết & bắt đầu lại
              </button>
            </div>

            {progress && (
              <div className="mt-4 text-sm text-neutral-400">
                Đang xử lý {progress.current + 1}/{progress.total}
                {progress.fileName && (
                  <span className="text-neutral-500"> — {progress.fileName}</span>
                )}
              </div>
            )}

            {resultUrl && (
              <div className="mt-6 p-5 bg-emerald-500/5 border border-emerald-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl" aria-hidden="true">✅</span>
                  <span className="font-semibold text-emerald-400">
                    Ghép xong! File đã sẵn sàng.
                  </span>
                </div>
                <a
                  href={resultUrl}
                  download="ghep-pdf-pdfviet.pdf"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 transition-colors"
                >
                  ⬇ Tải file PDF đã ghép
                </a>
              </div>
            )}
          </div>
        )}

        {items.length === 0 && (
          <div className="mt-8 p-5 bg-neutral-900/50 border border-neutral-800 rounded-xl text-sm text-neutral-400">
            <p className="font-medium text-neutral-300 mb-2">💡 Mẹo dùng:</p>
            <ul className="space-y-1.5 list-disc list-inside text-neutral-400">
              <li>
                Để chọn trang cụ thể, gõ theo dạng:{" "}
                <code className="px-1.5 py-0.5 bg-neutral-800 rounded text-amber-400">
                  1-3, 5, 7-10
                </code>
              </li>
              <li>Để trống ô &quot;Trang muốn lấy&quot; = lấy toàn bộ file đó.</li>
              <li>Kéo thả các file để sắp xếp lại thứ tự ghép.</li>
              <li>File có mật khẩu cần được gỡ mật khẩu trước khi ghép.</li>
            </ul>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
