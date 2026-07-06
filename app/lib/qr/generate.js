/**
 * Tạo mã QR từ chuỗi text/URL/vCard.
 *
 * Dùng `qrcode` lib (~50KB) — render trực tiếp ra canvas hoặc data URL.
 * Lazy import để không bloat bundle initial.
 *
 * @param {string} text
 * @param {{ size?: number, margin?: number, errorCorrection?: "L"|"M"|"Q"|"H", color?: string, background?: string }} options
 * @returns {Promise<string>} data URL PNG
 */
export async function generateQrDataUrl(text, options = {}) {
  if (!text || !text.trim()) throw new Error("Chưa có nội dung để tạo mã QR.");

  const QRCode = (await import("qrcode")).default;
  const {
    size = 512,
    margin = 2,
    errorCorrection = "M",
    color = "#000000",
    background = "#FFFFFF",
  } = options;

  return await QRCode.toDataURL(text, {
    width: size,
    margin,
    errorCorrectionLevel: errorCorrection,
    color: { dark: color, light: background },
  });
}
