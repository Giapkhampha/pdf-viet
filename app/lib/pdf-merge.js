/**
 * Ghép nhiều file PDF thành 1 file PDF duy nhất, có thể chỉ định trang cho từng file.
 *
 * Chạy 100% client-side bằng pdf-lib — file không rời khỏi máy user.
 *
 * @param {Array<{file: File, pageRanges: number[] | null}>} items
 *   - file: File object từ <input type="file">
 *   - pageRanges: mảng số trang 1-indexed (đã parse), hoặc null = lấy tất cả
 * @param {(progress: {current: number, total: number, fileName: string}) => void} [onProgress]
 *   Callback report tiến độ (số file đã xử lý / tổng).
 * @returns {Promise<Uint8Array>} Bytes của file PDF kết quả
 */
export async function mergePdfs(items, onProgress) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Bạn cần chọn ít nhất 1 file PDF.");
  }

  // Lazy import — pdf-lib chỉ chạy ở client
  const { PDFDocument } = await import("pdf-lib");

  const mergedPdf = await PDFDocument.create();
  const total = items.length;

  for (let i = 0; i < items.length; i++) {
    const { file, pageRanges } = items[i];
    onProgress?.({ current: i, total, fileName: file.name });

    let arrayBuffer;
    try {
      arrayBuffer = await file.arrayBuffer();
    } catch {
      throw new Error(
        `Không đọc được file "${file.name}". Bạn thử lại hoặc dùng file khác nhé.`
      );
    }

    let srcPdf;
    try {
      srcPdf = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: false,
      });
    } catch (err) {
      const msg = String(err?.message || "");
      if (/encrypted|password/i.test(msg)) {
        throw new Error(
          `File "${file.name}" có mật khẩu. Vui lòng gỡ mật khẩu trước khi ghép.`
        );
      }
      throw new Error(
        `File "${file.name}" có vẻ bị hỏng hoặc không phải PDF hợp lệ.`
      );
    }

    const totalPages = srcPdf.getPageCount();
    const indices =
      pageRanges == null
        ? Array.from({ length: totalPages }, (_, idx) => idx)
        : pageRanges.map((p) => p - 1).filter((p) => p >= 0 && p < totalPages);

    if (indices.length === 0) {
      throw new Error(
        `Phạm vi trang của file "${file.name}" không có trang hợp lệ nào.`
      );
    }

    const copiedPages = await mergedPdf.copyPages(srcPdf, indices);
    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
  }

  onProgress?.({ current: total, total, fileName: "" });

  const bytes = await mergedPdf.save();
  return bytes;
}

/**
 * Đếm số trang của 1 file PDF (dùng cho UI hiển thị "File này có X trang").
 * @param {File} file
 * @returns {Promise<number>}
 */
export async function countPdfPages(file) {
  const { PDFDocument } = await import("pdf-lib");
  const buf = await file.arrayBuffer();
  try {
    const pdf = await PDFDocument.load(buf);
    return pdf.getPageCount();
  } catch {
    return 0;
  }
}
