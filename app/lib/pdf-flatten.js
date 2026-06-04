/**
 * "Làm phẳng" PDF — re-save không dùng object streams nên các form field,
 * annotation, signature appearance sẽ được render thành nội dung tĩnh.
 */
export async function flattenPdf(file) {
  const { PDFDocument } = await import("pdf-lib");
  const buf = await file.arrayBuffer();
  const src = await PDFDocument.load(buf, { ignoreEncryption: true });
  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, src.getPageIndices());
  pages.forEach((p) => doc.addPage(p));
  return await doc.save({ useObjectStreams: false });
}
