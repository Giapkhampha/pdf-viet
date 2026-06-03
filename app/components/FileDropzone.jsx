"use client";

import { useRef, useState, useCallback } from "react";

const DEFAULT_MAX_SIZE_MB = 50;

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file, accept, maxSizeMB) {
  if (accept && !accept.split(",").map((s) => s.trim()).includes(file.type)) {
    return `File "${file.name}" không đúng định dạng. Chỉ chấp nhận ${accept}.`;
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `File "${file.name}" quá lớn (${formatBytes(file.size)}). Tối đa ${maxSizeMB} MB.`;
  }
  return null;
}

/**
 * Reusable file dropzone component.
 *
 * Props:
 *   accept     - MIME type string, e.g. "application/pdf"
 *   multiple   - allow multiple files (default: false)
 *   onFiles    - callback(File[]) called with valid files
 *   maxSizeMB  - max size per file in MB (default: 50)
 */
export default function FileDropzone({ accept, multiple = false, onFiles, maxSizeMB = DEFAULT_MAX_SIZE_MB }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  const processFiles = useCallback(
    (incoming) => {
      setError("");
      const candidates = multiple ? Array.from(incoming) : [incoming[0]];

      const errors = [];
      const valid = [];

      for (const file of candidates) {
        const err = validateFile(file, accept, maxSizeMB);
        if (err) errors.push(err);
        else valid.push(file);
      }

      if (errors.length > 0) {
        setError(errors[0]);
        return;
      }

      const next = multiple ? [...files, ...valid] : valid;
      setFiles(next);
      onFiles?.(next);
    },
    [accept, maxSizeMB, multiple, files, onFiles]
  );

  const removeFile = useCallback(
    (index) => {
      const next = files.filter((_, i) => i !== index);
      setFiles(next);
      onFiles?.(next);
      setError("");
    },
    [files, onFiles]
  );

  // Drag events
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  };

  const onInputChange = (e) => {
    if (e.target.files?.length > 0) processFiles(e.target.files);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const openPicker = () => inputRef.current?.click();

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPicker(); }
  };

  return (
    <div className="w-full space-y-3">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Vùng kéo thả file hoặc nhấn để chọn file"
        onClick={openPicker}
        onKeyDown={onKeyDown}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={[
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed",
          "bg-neutral-900 px-6 py-12 text-center cursor-pointer",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
          isDragging
            ? "border-emerald-400 bg-emerald-950/20"
            : "border-neutral-700 hover:border-emerald-500",
        ].join(" ")}
      >
        <span className="text-4xl select-none">📄</span>
        <div>
          <p className="text-neutral-200 font-medium">
            Kéo & thả file vào đây
          </p>
          <p className="text-neutral-500 text-sm mt-1">
            hoặc <span className="text-emerald-400 underline underline-offset-2">nhấn để chọn file</span>
          </p>
        </div>
        <p className="text-neutral-600 text-xs">
          Tối đa {maxSizeMB} MB · {accept ?? "Mọi định dạng"}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onInputChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200"
        >
          ⚠️ {error}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2" aria-label="Danh sách file đã chọn">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl shrink-0">📄</span>
                <div className="min-w-0">
                  <p className="text-sm text-neutral-200 truncate font-medium">{file.name}</p>
                  <p className="text-xs text-neutral-500">{formatBytes(file.size)}</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                aria-label={`Xoá file ${file.name}`}
                className="shrink-0 text-neutral-500 hover:text-red-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
