import { loadImage, releaseImage, canvasToBlob } from "@/app/lib/image/_shared";

/**
 * Nén ảnh — re-encode qua Canvas với quality thấp hơn.
 *
 * Lưu ý: format PNG là lossless, slider quality không có tác dụng nhiều.
 * Để giảm dung lượng PNG đáng kể, user nên convert sang JPEG hoặc WebP.
 *
 * @param {File} file
 * @param {{ quality?: number, format?: string }} options
 *   - quality 0..1 (default 0.7)
 *   - format: giữ nguyên nếu không truyền
 */
export async function compressImage(file, { quality = 0.7, format } = {}) {
  if (quality < 0 || quality > 1) {
    throw new Error("Chất lượng phải từ 0 đến 1.");
  }

  const img = await loadImage(file);
  try {
    const targetType = format || (file.type === "image/png" ? "image/png" : "image/jpeg");
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (targetType === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    return await canvasToBlob(canvas, targetType, quality);
  } finally {
    releaseImage(img);
  }
}
