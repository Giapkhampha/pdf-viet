"use client";

import { useState } from "react";
import ToolLayout from "@/app/components/ToolLayout";
import ToolDropzone from "@/app/components/ToolDropzone";
import { decodeQrFromImage } from "@/app/lib/qr/decode";

function detectType(text) {
  if (!text) return { kind: "text", icon: "📝", label: "Văn bản" };
  if (/^https?:\/\//i.test(text)) return { kind: "url", icon: "🔗", label: "Đường dẫn URL" };
  if (/^WIFI:/i.test(text)) return { kind: "wifi", icon: "📶", label: "Thông tin WiFi" };
  if (/^BEGIN:VCARD/i.test(text)) return { kind: "vcard", icon: "👤", label: "Danh thiếp vCard" };
  if (/^mailto:/i.test(text)) return { kind: "email", icon: "📧", label: "Email" };
  if (/^tel:/i.test(text)) return { kind: "tel", icon: "📞", label: "Số điện thoại" };
  return { kind: "text", icon: "📝", label: "Văn bản" };
}

export default function DocQrPage() {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const file = files[0] || null;

  const handleFilesChange = async (newFiles) => {
    setFiles(newFiles);
    setError("");
    setResult(null);
    const f = newFiles[0];
    if (!f) return;

    setProcessing(true);
    try {
      const r = await decodeQrFromImage(f);
      setResult(r);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.data) return;
    await navigator.clipboard.writeText(result.data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const type = result ? detectType(result.data) : null;
  const isUrl = type?.kind === "url";

  return (
    <ToolLayout
      title="Đọc mã QR"
      icon="🔍"
      desc="Tải ảnh chụp/screenshot có mã QR, tool sẽ decode ra văn bản, URL, WiFi, vCard... Decode chạy hoàn toàn trên trình duyệt — ảnh không upload."
    >
      <div className="space-y-5">
        <ToolDropzone
          files={files}
          onChange={handleFilesChange}
          accept="image/*"
          multiple={false}
          maxSizeMB={20}
          disabled={processing}
        />

        {processing && (
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-300 flex items-center gap-3">
            <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            Đang quét mã QR trong ảnh...
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200">
            ⚠️ {error}
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl" aria-hidden="true">{type.icon}</span>
                <div>
                  <p className="text-xs text-emerald-300 uppercase tracking-wider">Phát hiện loại</p>
                  <p className="text-sm font-semibold text-neutral-100">{type.label}</p>
                </div>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
                <p className="text-sm text-neutral-100 font-mono break-all whitespace-pre-wrap">
                  {result.data}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-sm font-semibold transition-colors"
                >
                  {copied ? "✓ Đã sao chép!" : "⧉ Sao chép"}
                </button>
                {isUrl && (
                  <a
                    href={result.data}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg border border-neutral-700 hover:border-neutral-500 text-sm text-neutral-100 transition-colors"
                  >
                    🔗 Mở link trong tab mới
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-xs text-neutral-400">
          💡 <strong className="text-neutral-300">Mẹo:</strong> ảnh phải đủ rõ và sát mã QR.
          Nếu mã QR là 1 phần nhỏ trong ảnh, hãy crop lại trước khi tải lên để decode chính xác.
        </div>
      </div>
    </ToolLayout>
  );
}
