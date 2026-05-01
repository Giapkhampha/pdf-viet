/**
 * Extract text content from a PDF file using pdfjs-dist.
 * Runs entirely client-side — no file is uploaded to any server.
 *
 * Returns an array of pages, each with positioned text items so callers
 * can reconstruct layout (line grouping, paragraph detection, etc.).
 */

let pdfjsModule = null;

async function getPdfjs() {
  if (!pdfjsModule) {
    pdfjsModule = await import("pdfjs-dist");
    pdfjsModule.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }
  return pdfjsModule;
}

/**
 * @param {File} file - PDF File object from the browser
 * @returns {Promise<Array<{
 *   pageNumber: number,
 *   items: Array<{ text: string, x: number, y: number, fontSize: number, fontName: string }>
 * }>>}
 */
export async function extractTextFromPDF(file) {
  const pdfjs = await getPdfjs();

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const pages = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const items = textContent.items
      .filter((item) => item.str && item.str.trim().length > 0)
      .map((item) => ({
        text: item.str,
        // transform: [scaleX, skewX, skewY, scaleY, translateX, translateY]
        x: item.transform[4],
        y: item.transform[5],
        fontSize: Math.abs(item.transform[3]),
        fontName: item.fontName || "",
      }));

    pages.push({ pageNumber: pageNum, items });
  }

  return pages;
}
