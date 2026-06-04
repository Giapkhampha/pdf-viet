/**
 * Ghép nhiều ảnh JPG/PNG thành 1 file PDF — mỗi ảnh 1 trang,
 * kích thước trang khớp với kích thước ảnh gốc.
 */
export async function imagesToPdf(files) {
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  for (const file of files) {
    const buf = await file.arrayBuffer();
    const isPng = file.type === "image/png" || /\.png$/i.test(file.name);
    const img = isPng ? await pdf.embedPng(buf) : await pdf.embedJpg(buf);
    const page = pdf.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  return await pdf.save();
}
