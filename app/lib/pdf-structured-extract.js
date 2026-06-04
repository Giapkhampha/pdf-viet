import { getPdfjs } from "@/app/lib/_pdfjs-loader";

/**
 * Trích xuất text có cấu trúc từ PDF — gom thành dòng theo Y, sort theo X.
 * Mỗi dòng có: text, fontSize, isBold, y. Dùng cho PDF → DOCX/XLSX.
 *
 * Khác `pdf-extract.js`:
 *   - `pdf-extract.js` trả về danh sách item thô (chưa gom dòng), dùng cho MD.
 *   - File này gom dòng + suy luận bold/size, dùng cho format có thể edit.
 */
export async function extractStructuredText(file, onProgress) {
  const pdfjs = await getPdfjs();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
  const allPages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(`Đang phân tích trang ${i}/${pdf.numPages}...`);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });

    // Gom các item theo dòng (cùng y ± 5px)
    const lineMap = new Map();
    for (const item of content.items) {
      if (!item.str?.trim()) continue;
      const y = Math.round(item.transform[5]);
      const key = [...lineMap.keys()].find((k) => Math.abs(k - y) < 5);
      if (key !== undefined) {
        lineMap.get(key).push(item);
      } else {
        lineMap.set(y, [item]);
      }
    }

    // Y lớn = trên cùng → sort descending để giữ thứ tự đọc
    const sortedLines = [...lineMap.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([y, items]) => {
        items.sort((a, b) => a.transform[4] - b.transform[4]);
        const text = items.map((it) => it.str).join(" ").trim();
        const fontSize = items[0]?.transform ? Math.abs(items[0].transform[3]) : 12;
        const isBold = items.some((it) =>
          it.fontName?.toLowerCase().includes("bold")
        );
        return { text, fontSize, isBold, y };
      })
      .filter((line) => line.text.length > 0);

    allPages.push({ pageNum: i, lines: sortedLines, height: viewport.height });
  }
  return allPages;
}
