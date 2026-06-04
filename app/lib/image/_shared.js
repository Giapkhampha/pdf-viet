/**
 * Helper dùng chung cho các tool ảnh — load file thành <img>, render canvas
 * ra Blob. Mọi xử lý chạy 100% client (Canvas API).
 */

/**
 * Load file ảnh thành HTMLImageElement đã decoded.
 * Caller cần tự revoke URL bằng `URL.revokeObjectURL(img._objectUrl)`.
 */
export async function loadImage(file) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  try {
    await img.decode();
  } catch (err) {
    URL.revokeObjectURL(url);
    throw new Error("Không đọc được ảnh — file có thể bị hỏng hoặc không đúng định dạng.");
  }
  img._objectUrl = url;
  return img;
}

export function releaseImage(img) {
  if (img?._objectUrl) URL.revokeObjectURL(img._objectUrl);
}

/**
 * Canvas → Blob qua toBlob (async). Quality chỉ áp dụng cho jpeg/webp.
 */
export function canvasToBlob(canvas, type = "image/jpeg", quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Không tạo được file đầu ra."))),
      type,
      quality
    );
  });
}

/**
 * Lấy kích thước gốc của ảnh.
 */
export async function getImageDimensions(file) {
  const img = await loadImage(file);
  const dim = { width: img.naturalWidth, height: img.naturalHeight };
  releaseImage(img);
  return dim;
}

/**
 * Format byte → KB / MB / GB.
 */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * Đổi extension của tên file. Vd: "ảnh.heic" → "ảnh.jpg".
 */
export function replaceExtension(name, newExt) {
  const dot = name.lastIndexOf(".");
  const base = dot === -1 ? name : name.slice(0, dot);
  return `${base}.${newExt.replace(/^\./, "")}`;
}
