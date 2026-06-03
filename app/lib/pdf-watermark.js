/**
 * Thêm watermark chữ chéo 45° vào giữa mỗi trang.
 * Dùng font Helvetica Bold tích hợp — không hỗ trợ dấu tiếng Việt
 * (pdf-lib cần embed font Unicode riêng cho tiếng Việt, sẽ làm ở Phase 2).
 */
export async function watermarkPdf(file, text) {
  const { PDFDocument, rgb, StandardFonts, degrees } = await import("pdf-lib");
  const buf = await file.arrayBuffer();
  const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  pdf.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const fontSize = Math.min(width, height) * 0.08;
    page.drawText(text, {
      x: (width - font.widthOfTextAtSize(text, fontSize)) / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(0.6, 0.6, 0.6),
      opacity: 0.35,
      rotate: degrees(45),
    });
  });
  return await pdf.save();
}
