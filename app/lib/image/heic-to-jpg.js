/**
 * Chuyển ảnh HEIC/HEIF (iPhone) sang JPG dùng `heic2any` (~200KB lazy load).
 *
 * Case use: ba mẹ Việt dùng iPhone gửi ảnh tài liệu — Windows / web
 * không mở được HEIC native, cần convert sang JPG.
 *
 * heic2any chạy WebAssembly để decode HEIC, không upload server.
 *
 * @param {File} file
 * @param {{ quality?: number }} options - 0..1, default 0.92
 * @returns {Promise<Blob>}
 */
export async function heicToJpg(file, { quality = 0.92 } = {}) {
  const mod = await import("heic2any");
  const heic2any = mod.default || mod;

  let result;
  try {
    result = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality,
    });
  } catch (err) {
    const msg = String(err?.message || err);
    if (/already.*browser.*readable/i.test(msg)) {
      throw new Error(
        "File này không phải HEIC/HEIF, bạn dùng tool 'Nén ảnh' cho JPG/PNG nhé."
      );
    }
    throw new Error("Không chuyển được file HEIC này. File có thể bị hỏng hoặc đã được mã hoá.");
  }

  // heic2any có thể trả Blob hoặc Blob[] (HEIC nhiều frame)
  return Array.isArray(result) ? result[0] : result;
}
