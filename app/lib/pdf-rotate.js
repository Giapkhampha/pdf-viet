/**
 * Xoay tất cả trang trong PDF theo góc tuỳ chọn (90, 180, 270).
 * Góc được cộng dồn với góc hiện tại của trang.
 */
export async function rotatePdf(file, deg) {
  const { PDFDocument, degrees } = await import("pdf-lib");
  const buf = await file.arrayBuffer();
  const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
  pdf.getPages().forEach((p) => {
    p.setRotation(degrees((p.getRotation().angle + deg) % 360));
  });
  return await pdf.save();
}
