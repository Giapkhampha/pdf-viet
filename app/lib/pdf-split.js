/**
 * Tách 1 PDF thành nhiều file — mỗi trang 1 file.
 * Trả về mảng { bytes: Uint8Array, name: string } để caller tải về.
 */
export async function splitPdfPerPage(file) {
  const { PDFDocument } = await import("pdf-lib");
  const buf = await file.arrayBuffer();
  const src = await PDFDocument.load(buf, { ignoreEncryption: true });
  const results = [];
  for (let i = 0; i < src.getPageCount(); i++) {
    const doc = await PDFDocument.create();
    const [page] = await doc.copyPages(src, [i]);
    doc.addPage(page);
    results.push({ bytes: await doc.save(), name: `trang_${i + 1}.pdf` });
  }
  return results;
}
