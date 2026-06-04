/**
 * Singleton loader for pdfjs-dist with the local worker.
 * Tất cả lib cần đọc PDF qua pdfjs-dist nên dùng helper này để
 * tránh khởi tạo worker nhiều lần và đảm bảo workerSrc nhất quán.
 */

let pdfjsModule = null;

export async function getPdfjs() {
  if (!pdfjsModule) {
    pdfjsModule = await import("pdfjs-dist");
    pdfjsModule.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }
  return pdfjsModule;
}
