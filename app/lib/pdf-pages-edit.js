import { parsePageRanges } from "@/app/lib/parse-page-ranges";

/**
 * Xoá các trang được liệt kê khỏi PDF.
 * @param {File} file
 * @param {string} pageInput - chuỗi "1,3,5-7"
 */
export async function deletePages(file, pageInput) {
  const { PDFDocument } = await import("pdf-lib");
  const buf = await file.arrayBuffer();
  const src = await PDFDocument.load(buf, { ignoreEncryption: true });
  const total = src.getPageCount();

  const toDelete = parsePageRanges(pageInput, total);
  if (!toDelete) {
    throw new Error("Vui lòng nhập số trang cần xoá, ví dụ: 1, 3, 5-7.");
  }
  const deleteSet = new Set(toDelete.map((p) => p - 1));
  const keep = [...Array(total).keys()].filter((i) => !deleteSet.has(i));
  if (keep.length === 0) {
    throw new Error("Không thể xoá tất cả trang — file kết quả sẽ rỗng.");
  }

  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, keep);
  pages.forEach((p) => doc.addPage(p));
  return await doc.save();
}

/**
 * Trích xuất các trang được liệt kê thành 1 PDF mới.
 */
export async function extractPages(file, pageInput) {
  const { PDFDocument } = await import("pdf-lib");
  const buf = await file.arrayBuffer();
  const src = await PDFDocument.load(buf, { ignoreEncryption: true });
  const total = src.getPageCount();

  const wanted = parsePageRanges(pageInput, total);
  if (!wanted) {
    throw new Error("Vui lòng nhập số trang cần trích xuất, ví dụ: 1, 3, 5-7.");
  }
  const indices = wanted.map((p) => p - 1);

  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, indices);
  pages.forEach((p) => doc.addPage(p));
  return await doc.save();
}
