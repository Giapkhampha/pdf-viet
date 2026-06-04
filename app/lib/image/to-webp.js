import { compressImage } from "@/app/lib/image/compress";

/**
 * Chuyển ảnh sang WebP. WebP nén tốt hơn JPEG/PNG trung bình 25-50%
 * ở cùng chất lượng cảm quan.
 *
 * @param {File} file - JPG / PNG input
 * @param {{ quality?: number }} options - default 0.8
 * @returns {Promise<Blob>}
 */
export async function imageToWebp(file, { quality = 0.8 } = {}) {
  return compressImage(file, { quality, format: "image/webp" });
}
