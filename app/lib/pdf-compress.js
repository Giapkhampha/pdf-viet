/**
 * Nén PDF — re-save với object streams được bật, giảm dung lượng metadata.
 * Không re-render hình ảnh ở DPI thấp hơn (Phase 2 sẽ làm).
 */
export async function compressPdf(file) {
  const { PDFDocument } = await import("pdf-lib");
  const buf = await file.arrayBuffer();
  const src = await PDFDocument.load(buf, { ignoreEncryption: true });
  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, src.getPageIndices());
  pages.forEach((p) => doc.addPage(p));
  return await doc.save({ useObjectStreams: true });
}
