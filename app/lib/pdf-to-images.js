import { getPdfjs } from "@/app/lib/_pdfjs-loader";

/**
 * Render từng trang PDF thành ảnh JPEG độ phân giải gấp đôi (scale 2x).
 * @param {File} file
 * @param {(msg: string) => void} [onProgress]
 * @returns {Promise<Array<{bytes: Uint8Array, name: string}>>}
 */
export async function pdfToImages(file, onProgress) {
  const pdfjs = await getPdfjs();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
  const results = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(`Đang render trang ${i}/${pdf.numPages}...`);
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    const blob = await new Promise((res) =>
      canvas.toBlob(res, "image/jpeg", 0.92)
    );
    results.push({
      bytes: new Uint8Array(await blob.arrayBuffer()),
      name: `trang_${i}.jpg`,
    });
  }
  return results;
}
