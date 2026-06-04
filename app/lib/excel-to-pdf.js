/**
 * Excel → PDF: chuyển sheet đầu tiên thành HTML table, mở cửa sổ in
 * dạng landscape, user chọn "Save as PDF".
 */
export async function excelToPdfViaPrint(file, onProgress) {
  const XLSX = await import("xlsx");
  onProgress?.("Đang đọc file Excel...");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const html = XLSX.utils.sheet_to_html(wb.Sheets[wb.SheetNames[0]]);

  onProgress?.("Đang mở cửa sổ in...");
  const win = window.open("", "_blank", "width=1000,height=600");
  if (!win) {
    throw new Error("Trình duyệt chặn cửa sổ in. Vui lòng cho phép popup rồi thử lại.");
  }
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${file.name}</title><style>
    @page { size: A4 landscape; margin: 10mm }
    body { font-family: Arial, sans-serif; font-size: 10pt }
    table { border-collapse: collapse; width: 100% }
    td, th { border: 1px solid #999; padding: 4px 6px }
    th { background: #f0f0f0 }
  </style></head><body>${html}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 800);
}
