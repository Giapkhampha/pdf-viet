/**
 * Tạo mã vạch bằng `bwip-js` (~150KB lazy load).
 *
 * Hỗ trợ rất nhiều loại barcode: code128, code39, ean13, ean8, upca, qrcode,
 * datamatrix, pdf417… Em expose 4 loại phổ biến nhất cho user.
 *
 * @param {string} text
 * @param {{ type: string, scale?: number, height?: number, includeText?: boolean }} options
 * @returns {Promise<string>} data URL PNG
 */
export async function generateBarcodeDataUrl(text, options = {}) {
  if (!text || !text.trim()) throw new Error("Chưa có nội dung để tạo mã vạch.");

  const bwipjs = (await import("bwip-js/browser")).default;
  const { type = "code128", scale = 3, height = 12, includeText = true } = options;

  // Tạo canvas off-screen rồi convert sang data URL
  const canvas = document.createElement("canvas");
  try {
    bwipjs.toCanvas(canvas, {
      bcid: type,
      text,
      scale,
      height,
      includetext: includeText,
      textxalign: "center",
      backgroundcolor: "FFFFFF",
    });
  } catch (err) {
    throw new Error(
      `Không tạo được mã vạch: ${err.message || "kiểm tra loại mã và độ dài text."}`
    );
  }

  return canvas.toDataURL("image/png");
}

export const BARCODE_TYPES = [
  { value: "code128", label: "Code 128", note: "Phổ biến nhất — chữ + số" },
  { value: "code39",  label: "Code 39",  note: "Logistics, công nghiệp" },
  { value: "ean13",   label: "EAN-13",   note: "Mã sản phẩm bán lẻ (13 số)" },
  { value: "ean8",    label: "EAN-8",    note: "Sản phẩm nhỏ (8 số)" },
];
