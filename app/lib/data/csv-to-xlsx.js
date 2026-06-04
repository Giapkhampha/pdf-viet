/**
 * CSV → XLSX bằng thư viện xlsx (đã có).
 *
 * xlsx tự nhận diện delimiter (`,` hoặc `;`) và quoted strings.
 * Encoding: đọc file dưới dạng ArrayBuffer → xlsx tự handle UTF-8 BOM.
 */
export async function csvToXlsx(file) {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  // Đọc CSV thành workbook. xlsx detect format từ extension/MIME.
  const wb = XLSX.read(buf, { type: "array" });
  // Re-export sang xlsx
  return new Uint8Array(XLSX.write(wb, { type: "array", bookType: "xlsx" }));
}
