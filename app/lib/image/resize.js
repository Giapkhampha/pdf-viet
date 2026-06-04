import { loadImage, releaseImage, canvasToBlob } from "@/app/lib/image/_shared";

/**
 * Đổi kích thước ảnh qua Canvas — dùng imageSmoothingQuality "high".
 *
 * @param {File} file
 * @param {{ width: number, height: number, format?: string, quality?: number }} options
 * @returns {Promise<Blob>}
 */
export async function resizeImage(file, { width, height, format, quality = 0.92 }) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    throw new Error("Kích thước phải là số nguyên dương.");
  }
  if (width > 8192 || height > 8192) {
    throw new Error("Kích thước tối đa 8192px — file kết quả sẽ quá lớn.");
  }

  const img = await loadImage(file);
  try {
    const targetType = format || (file.type === "image/png" ? "image/png" : "image/jpeg");
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width);
    canvas.height = Math.round(height);

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Nếu output là JPEG, đổ nền trắng (JPEG không hỗ trợ alpha).
    if (targetType === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await canvasToBlob(canvas, targetType, quality);
  } finally {
    releaseImage(img);
  }
}
