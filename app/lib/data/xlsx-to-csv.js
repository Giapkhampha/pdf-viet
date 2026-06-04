/**
 * XLSX → CSV.
 *
 * - Trả về string UTF-8 cho từng sheet.
 * - Prepend BOM `﻿` để Excel mở file CSV hiển thị tiếng Việt đúng
 *   (Excel mặc định đọc CSV dạng Windows-1252 nếu không có BOM).
 */
export async function xlsxToCsv(file, sheetName) {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });

  const targetSheet = sheetName || wb.SheetNames[0];
  const ws = wb.Sheets[targetSheet];
  if (!ws) throw new Error(`Không tìm thấy sheet "${targetSheet}".`);

  const csv = XLSX.utils.sheet_to_csv(ws, { FS: "," });
  return "﻿" + csv; // BOM cho Excel
}

export async function listSheetNames(file) {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  return wb.SheetNames;
}
