/**
 * Nhúng chữ ký (data URL PNG từ canvas) vào góc dưới-phải trang cuối PDF.
 */
export async function signPdf(file, signatureDataUrl) {
  if (!signatureDataUrl) {
    throw new Error("Vui lòng vẽ chữ ký trước khi ký.");
  }
  const { PDFDocument } = await import("pdf-lib");
  const buf = await file.arrayBuffer();
  const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });

  const base64 = signatureDataUrl.split(",")[1];
  const sigBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const sigImg = await pdf.embedPng(sigBytes);

  const pages = pdf.getPages();
  const last = pages[pages.length - 1];
  const { width } = last.getSize();
  last.drawImage(sigImg, { x: width - 150, y: 30, width: 120, height: 50 });
  return await pdf.save();
}
