/**
 * Thêm số trang dạng "N / Tổng" vào giữa cuối mỗi trang PDF.
 */
export async function addPageNumbers(file) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const buf = await file.arrayBuffer();
  const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  pages.forEach((page, i) => {
    const { width } = page.getSize();
    const text = `${i + 1} / ${pages.length}`;
    page.drawText(text, {
      x: (width - font.widthOfTextAtSize(text, 10)) / 2,
      y: 20,
      size: 10,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  });
  return await pdf.save();
}
