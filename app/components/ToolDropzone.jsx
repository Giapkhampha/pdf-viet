"use client";

import { useRef, useState, useCallback } from "react";

const DEFAULT_MAX_SIZE_MB = 100;

function formatBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function acceptMatch(file, accept) {
  if (!accept) return true;
  return accept.split(",").map((s) => s.trim()).some((rule) => {
    if (!rule) return false;
    if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule.toLowerCase());
    if (rule.endsWith("/*")) return file.type.startsWith(rule.slice(0, -1));
    return file.type === rule;
  });
}

/**
 * Vùng kéo thả + danh sách file (controlled).
 *
 * Props:
 *   files       — File[] hiện tại (controlled)
 *   onChange    — (nextFiles: File[]) => void
 *   accept      — "application/pdf" | ".pdf,.docx" | "image/*"
 *   multiple    — Cho phép nhiều file
 *   disabled    — Disable khi đang xử lý
 *   maxSizeMB   — Max size mỗi file (default 100MB)
 *   reorderable — Cho phép kéo thả + up/down (chỉ khi multiple)
 */
export default function ToolDropzone({
  files = [],
  onChange,
  accept,
  multiple = false,
  disabled = false,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  reorderable = true,
}) {
  const inputRef = useRef(null);
  const dragIdx = useRef(null);
  const [isHover, setIsHover] = useState(false);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [error, setError] = useState("");

  const showReorder = multiple && reorderable;

  const addFiles = useCallback(
    (incoming) => {
      setError("");
      const candidates = Array.from(incoming || []);
      if (candidates.length === 0) return;

      const valid = [];
      const errors = [];
      for (const file of candidates) {
        if (!acceptMatch(file, accept)) {
          errors.push(`File "${file.name}" không đúng định dạng.`);
          continue;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          errors.push(`File "${file.name}" lớn hơn ${maxSizeMB} MB.`);
          continue;
        }
        valid.push(file);
      }
      if (errors.length > 0) setError(errors[0]);

      if (valid.length === 0) return;
      if (!multiple) {
        onChange?.([valid[0]]);
        return;
      }

      const seen = new Set(files.map((f) => `${f.name}|${f.size}`));
      const merged = [...files];
      for (const f of valid) {
        const key = `${f.name}|${f.size}`;
        if (!seen.has(key)) {
          merged.push(f);
          seen.add(key);
        }
      }
      onChange?.(merged);
    },
    [accept, files, maxSizeMB, multiple, onChange]
  );

  const removeAt = (idx) => onChange?.(files.filter((_, i) => i !== idx));
  const moveTo = (from, to) => {
    if (to < 0 || to >= files.length || from === to) return;
    const next = [...files];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange?.(next);
  };

  const openPicker = () => !disabled && inputRef.current?.click();
  const onInputChange = (e) => {
    addFiles(e.target.files);
    e.target.value = ""; // cho phép chọn lại cùng file
  };
  const onZoneDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsHover(true);
  };
  const onZoneDragLeave = () => setIsHover(false);
  const onZoneDrop = (e) => {
    e.preventDefault();
    setIsHover(false);
    if (!disabled) addFiles(e.dataTransfer.files);
  };
  const onZoneKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled) {
      e.preventDefault();
      openPicker();
    }
  };

  return (
    <div className="w-full space-y-3">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Vùng kéo thả file"
        aria-disabled={disabled}
        onClick={openPicker}
        onKeyDown={onZoneKeyDown}
        onDragOver={onZoneDragOver}
        onDragLeave={onZoneDragLeave}
        onDrop={onZoneDrop}
        className={[
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed",
          "bg-neutral-900 px-6 py-10 text-center transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
          disabled
            ? "border-neutral-800 cursor-not-allowed opacity-60"
            : isHover
            ? "border-emerald-400 bg-emerald-950/20 cursor-pointer"
            : "border-neutral-700 hover:border-emerald-500 cursor-pointer",
        ].join(" ")}
      >
        <span className="text-4xl select-none">📂</span>
        <div>
          <p className="text-neutral-200 font-medium">
            {isHover ? "Thả file vào đây..." : "Kéo & thả file vào đây"}
          </p>
          <p className="text-neutral-500 text-sm mt-1">
            hoặc{" "}
            <span className="text-emerald-400 underline underline-offset-2">
              bấm để chọn file
            </span>
          </p>
        </div>
        <p className="text-neutral-600 text-xs">
          Tối đa {maxSizeMB} MB · {accept ?? "Mọi định dạng"}
          {multiple && " · Chọn nhiều file"}
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

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200"
        >
          ⚠️ {error}
        </div>
      )}

      {files.length > 0 && (
        <ul className="space-y-2" aria-label="Danh sách file đã chọn">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${file.size}-${i}`}
              draggable={showReorder && !disabled}
              onDragStart={() => {
                dragIdx.current = i;
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (showReorder) setDragOverIdx(i);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (showReorder && dragIdx.current !== null && dragIdx.current !== i) {
                  moveTo(dragIdx.current, i);
                }
                dragIdx.current = null;
                setDragOverIdx(null);
              }}
              onDragEnd={() => {
                dragIdx.current = null;
                setDragOverIdx(null);
              }}
              className={[
                "flex items-center gap-3 rounded-lg border bg-neutral-900 px-3 py-3 transition-colors",
                dragOverIdx === i ? "border-emerald-500/50" : "border-neutral-800",
                showReorder && !disabled ? "cursor-grab active:cursor-grabbing" : "",
              ].join(" ")}
            >
              {showReorder && (
                <span className="text-neutral-600 text-xs select-none" aria-hidden="true">
                  ⠿
                </span>
              )}
              {multiple && (
                <span className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
              )}
              <span className="text-emerald-400 shrink-0" aria-hidden="true">
                📄
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-100 truncate font-medium">{file.name}</p>
                <p className="text-xs text-neutral-500">{formatBytes(file.size)}</p>
              </div>

              {showReorder && (
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveTo(i, i - 1)}
                    disabled={i === 0 || disabled}
                    aria-label={`Di chuyển ${file.name} lên`}
                    className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveTo(i, i + 1)}
                    disabled={i === files.length - 1 || disabled}
                    aria-label={`Di chuyển ${file.name} xuống`}
                    className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                  >
                    ↓
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeAt(i);
                }}
                disabled={disabled}
                aria-label={`Xoá ${file.name}`}
                className="shrink-0 w-7 h-7 rounded text-neutral-500 hover:text-red-400 hover:bg-red-950/30 disabled:opacity-40 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                ✕
              </button>
            </li>
          ))}

          {multiple && !disabled && (
            <button
              type="button"
              onClick={openPicker}
              className="w-full py-2.5 rounded-lg border border-dashed border-neutral-800 text-sm text-neutral-500 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
            >
              + Thêm file khác
            </button>
          )}
        </ul>
      )}
    </div>
  );
}
