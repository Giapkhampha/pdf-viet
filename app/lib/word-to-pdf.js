/**
 * Word → PDF: dùng mammoth chuyển DOCX → HTML, mở cửa sổ in,
 * user chọn "Save as PDF" để lưu.
 *
 * Tại sao dùng print dialog: chuyển HTML → PDF chuẩn (giữ font tiếng Việt,
 * layout, page break) cần engine PDF nặng — print engine của browser
 * làm việc này miễn phí và tốt.
 */
export async function wordToPdfViaPrint(file, onProgress) {
  const mammoth = await import("mammoth");
  onProgress?.("Đang đọc file Word...");
  const buf = await file.arrayBuffer();
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buf });

  onProgress?.("Đang mở cửa sổ in...");
  const win = window.open("", "_blank", "width=800,height=600");
  if (!win) {
    throw new Error("Trình duyệt chặn cửa sổ in. Vui lòng cho phép popup rồi thử lại.");
  }
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${file.name}</title><style>
    @page { margin: 20mm }
    body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.6 }
    table { border-collapse: collapse; width: 100% }
    td, th { border: 1px solid #ccc; padding: 6px }
  </style></head><body>${html}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 800);
}
