/**
 * Nén PDF xuống dưới một dung lượng mục tiêu (3/5/10 MB…).
 *
 * Cách làm: render từng trang PDF ra canvas bằng pdfjs-dist, encode lại thành
 * JPEG (loại bỏ font/vector thừa, hạ DPI + chất lượng), rồi dựng PDF mới bằng
 * pdf-lib với mỗi trang là 1 ảnh. Thử lần lượt từ nét → nhẹ cho tới khi đạt
 * mục tiêu. Đánh đổi: PDF kết quả là ảnh (mất lớp text/chọn-copy) — đây là
 * cách duy nhất để ép dung lượng đáng tin cậy 100% trên trình duyệt.
 *
 * Toàn bộ chạy ở client, không upload file lên server (cam kết riêng tư).
 */
import { getPdfjs } from "@/app/lib/_pdfjs-loader";

// Các nấc thử, từ nét nhất → nhẹ nhất. Mỗi nấc gồm scale (DPI tương đối) và
// chất lượng JPEG. Nhóm theo scale để chỉ render lại khi scale đổi (render là
// bước nặng; re-encode JPEG thì nhẹ).
const ATTEMPTS = [
  { scale: 2.0, quality: 0.9 },
  { scale: 2.0, quality: 0.8 },
  { scale: 1.5, quality: 0.75 },
  { scale: 1.5, quality: 0.6 },
  { scale: 1.2, quality: 0.55 },
  { scale: 1.0, quality: 0.5 },
  { scale: 1.0, quality: 0.4 },
  { scale: 0.8, quality: 0.4 },
  { scale: 0.7, quality: 0.35 },
  { scale: 0.6, quality: 0.3 },
];

function canvasToJpeg(canvas, quality) {
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
  );
}

/**
 * Render tất cả trang của PDF ra canvas ở một scale nhất định.
 * Tô nền trắng trước khi render (JPEG không có alpha).
 */
async function renderPages(pdf, scale, onProgress) {
  const canvases = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(`Đọc trang ${i}/${pdf.numPages} (độ nét ${Math.round(scale * 72)} DPI)...`);
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const ptViewport = page.getViewport({ scale: 1 }); // kích thước thật (point)
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    canvases.push({ canvas, widthPt: ptViewport.width, heightPt: ptViewport.height });
  }
  return canvases;
}

/** Dựng PDF mới: mỗi trang là 1 ảnh JPEG, kích thước theo point gốc. */
async function buildPdf(canvases, quality) {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  for (const { canvas, widthPt, heightPt } of canvases) {
    const blob = await canvasToJpeg(canvas, quality);
    const jpg = await doc.embedJpg(new Uint8Array(await blob.arrayBuffer()));
    const page = doc.addPage([widthPt, heightPt]);
    page.drawImage(jpg, { x: 0, y: 0, width: widthPt, height: heightPt });
  }
  return doc.save();
}

/**
 * Nén PDF xuống dưới `targetBytes`.
 * @param {File} file
 * @param {{ targetBytes: number, onProgress?: (msg: string) => void }} opts
 * @returns {Promise<{ bytes: Uint8Array, size: number, reached: boolean,
 *   originalSize: number }>}
 *   - reached: true nếu đạt mục tiêu; false nếu chỉ trả về bản nhỏ nhất có thể.
 */
export async function compressPdfToTarget(file, { targetBytes, onProgress } = {}) {
  const pdfjs = await getPdfjs();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
  const originalSize = file.size;

  let best = null; // { bytes, size }
  let renderedScale = null;
  let canvases = null;

  for (let idx = 0; idx < ATTEMPTS.length; idx++) {
    const { scale, quality } = ATTEMPTS[idx];

    // Chỉ render lại khi scale thay đổi.
    if (scale !== renderedScale) {
      canvases = await renderPages(pdf, scale, onProgress);
      renderedScale = scale;
    }

    onProgress?.(`Đang nén... (thử mức ${idx + 1}/${ATTEMPTS.length})`);
    const bytes = await buildPdf(canvases, quality);
    const size = bytes.byteLength;

    if (!best || size < best.size) best = { bytes, size };

    if (targetBytes && size <= targetBytes) {
      return { bytes, size, reached: true, originalSize };
    }
  }

  // Không nấc nào đạt mục tiêu → trả về bản nhỏ nhất.
  return {
    bytes: best.bytes,
    size: best.size,
    reached: !targetBytes,
    originalSize,
  };
}

/**
 * Giữ lại API cũ (re-save object streams) cho đường dẫn generic [slug] nếu còn
 * dùng. Không đảm bảo giảm dung lượng — dùng compressPdfToTarget cho UI mới.
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
