/**
 * HTML → PDF: đọc nguyên text file, ghi vào cửa sổ mới, gọi print.
 */
export async function htmlToPdfViaPrint(file, onProgress) {
  onProgress?.("Đang đọc file HTML...");
  const text = await file.text();
  const win = window.open("", "_blank", "width=800,height=600");
  if (!win) {
    throw new Error("Trình duyệt chặn cửa sổ in. Vui lòng cho phép popup rồi thử lại.");
  }
  win.document.write(text);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 800);
}
