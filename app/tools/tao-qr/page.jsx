"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/app/components/ToolLayout";
import { generateQrDataUrl } from "@/app/lib/qr/generate";

const TEMPLATES = [
  { key: "text",  label: "Văn bản / URL", placeholder: "https://giapkhampha.me hoặc bất kỳ text nào" },
  { key: "wifi",  label: "WiFi",           placeholder: "Bấm để dùng form WiFi bên dưới" },
  { key: "vcard", label: "Danh thiếp",     placeholder: "Bấm để dùng form danh thiếp bên dưới" },
];

function buildWifi({ ssid, password, encryption = "WPA", hidden = false }) {
  const esc = (s) => String(s).replace(/[\\;,":]/g, (c) => "\\" + c);
  return `WIFI:T:${encryption};S:${esc(ssid)};P:${esc(password)};${hidden ? "H:true;" : ""};`;
}

function buildVcard({ name, phone, email, org, url }) {
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];
  if (name) lines.push(`FN:${name}`);
  if (org) lines.push(`ORG:${org}`);
  if (phone) lines.push(`TEL:${phone}`);
  if (email) lines.push(`EMAIL:${email}`);
  if (url) lines.push(`URL:${url}`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

export default function TaoQrPage() {
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("");
  const [wifi, setWifi] = useState({ ssid: "", password: "", encryption: "WPA", hidden: false });
  const [vcard, setVcard] = useState({ name: "", phone: "", email: "", org: "", url: "" });
  const [size, setSize] = useState(512);
  const [errorCorrection, setErrorCorrection] = useState("M");
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  // Tính content theo mode
  const getContent = () => {
    if (mode === "wifi") {
      if (!wifi.ssid) return "";
      return buildWifi(wifi);
    }
    if (mode === "vcard") {
      if (!vcard.name) return "";
      return buildVcard(vcard);
    }
    return text;
  };

  const handleGenerate = async () => {
    const content = getContent();
    if (!content) {
      setError("Vui lòng nhập nội dung cho mã QR.");
      return;
    }
    setProcessing(true);
    setError("");
    try {
      const url = await generateQrDataUrl(content, { size, errorCorrection });
      setDataUrl(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Auto-generate khi text/options thay đổi (chỉ với mode text)
  useEffect(() => {
    setDataUrl("");
    setError("");
  }, [mode]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-${Date.now()}.png`;
    a.click();
  };

  return (
    <ToolLayout
      title="Tạo mã QR"
      icon="📱"
      desc="Tạo mã QR từ văn bản, URL, thông tin WiFi, danh thiếp (vCard). Tải về PNG độ phân giải cao. Mọi xử lý chạy trên trình duyệt."
    >
      <div className="space-y-5">
        {/* Mode picker */}
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setMode(t.key)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                mode === t.key
                  ? "border-blue-500/60 bg-blue-950/30 text-blue-300"
                  : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Input theo mode */}
        {mode === "text" && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="https://giapkhampha.me hoặc text bất kỳ..."
            rows={4}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-blue-500/60 resize-y"
          />
        )}

        {mode === "wifi" && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-3">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Tên WiFi (SSID)</label>
              <input
                type="text"
                value={wifi.ssid}
                onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                placeholder="MyHome_WiFi"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-blue-500/60"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Mật khẩu</label>
              <input
                type="text"
                value={wifi.password}
                onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                placeholder="••••••••"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-blue-500/60"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Bảo mật</label>
                <select
                  value={wifi.encryption}
                  onChange={(e) => setWifi({ ...wifi, encryption: e.target.value })}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-blue-500/60"
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Không mật khẩu</option>
                </select>
              </div>
              <label className="flex items-end gap-2 pb-2 text-sm text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wifi.hidden}
                  onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })}
                  className="w-4 h-4 accent-blue-500"
                />
                Mạng ẩn
              </label>
            </div>
          </div>
        )}

        {mode === "vcard" && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-3">
            {[
              { key: "name", label: "Họ và tên", placeholder: "Nguyễn Văn A" },
              { key: "phone", label: "Số điện thoại", placeholder: "0901234567" },
              { key: "email", label: "Email", placeholder: "a@example.com" },
              { key: "org", label: "Công ty / Tổ chức", placeholder: "GIAP KHAMPHA" },
              { key: "url", label: "Website", placeholder: "https://giapkhampha.me" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs text-neutral-500 mb-1">{f.label}</label>
                <input
                  type="text"
                  value={vcard[f.key]}
                  onChange={(e) => setVcard({ ...vcard, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-blue-500/60"
                />
              </div>
            ))}
          </div>
        )}

        {/* Options */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Kích thước (px)</label>
            <select
              value={size}
              onChange={(e) => setSize(+e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-blue-500/60"
            >
              <option value="256">256 (nhỏ)</option>
              <option value="512">512 (vừa)</option>
              <option value="1024">1024 (in ấn)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Mức sửa lỗi</label>
            <select
              value={errorCorrection}
              onChange={(e) => setErrorCorrection(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-blue-500/60"
            >
              <option value="L">Thấp (7%)</option>
              <option value="M">Vừa (15%) — khuyến nghị</option>
              <option value="Q">Cao (25%)</option>
              <option value="H">Tối đa (30%)</option>
            </select>
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200">
            ⚠️ {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={processing}
          className="w-full px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-neutral-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? "Đang tạo..." : "Tạo mã QR →"}
        </button>

        {dataUrl && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-center">
            <p className="text-sm text-emerald-300 font-medium mb-3">✓ Đã tạo mã QR</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dataUrl}
              alt="QR code"
              className="mx-auto rounded-lg border border-neutral-800 bg-white p-2"
              style={{ width: Math.min(size, 320), height: Math.min(size, 320) }}
            />
            <button
              type="button"
              onClick={handleDownload}
              className="mt-4 inline-flex px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-sm font-semibold transition-colors"
            >
              ⬇ Tải PNG
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
