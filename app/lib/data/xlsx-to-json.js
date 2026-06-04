/**
 * XLSX → JSON. Mỗi sheet thành 1 mảng object, row 1 là headers.
 *
 * @param {File} file
 * @param {{ sheet?: string, pretty?: boolean }} options
 * @returns {Promise<string>} JSON string
 */
export async function xlsxToJson(file, { sheet, pretty = true } = {}) {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });

  const target = sheet || wb.SheetNames[0];
  const ws = wb.Sheets[target];
  if (!ws) throw new Error(`Không tìm thấy sheet "${target}".`);

  // defval: "" để cell rỗng trở thành chuỗi rỗng thay vì bị skip
  const data = XLSX.utils.sheet_to_json(ws, { defval: "" });

  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}
