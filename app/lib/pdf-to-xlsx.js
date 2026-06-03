import { extractStructuredText } from "@/app/lib/pdf-structured-extract";

/**
 * Chuyển PDF → XLSX: mỗi dòng text từ PDF thành 1 row trong sheet,
 * kèm metadata trang/dòng/font size/bold để dễ lọc.
 */
export async function pdfToXlsx(file, onProgress) {
  const pages = await extractStructuredText(file, onProgress);
  onProgress?.("Đang tạo file Excel...");
  const XLSX = await import("xlsx");

  const rows = [["Trang", "Dòng (y)", "Nội dung", "Font size", "Bold"]];
  for (const page of pages) {
    for (const line of page.lines) {
      rows.push([
        page.pageNum,
        line.y,
        line.text,
        Math.round(line.fontSize),
        line.isBold ? "Có" : "",
      ]);
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 6 }, { wch: 8 }, { wch: 80 }, { wch: 10 }, { wch: 6 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "PDF Content");
  return new Uint8Array(XLSX.write(wb, { type: "array", bookType: "xlsx" }));
}
