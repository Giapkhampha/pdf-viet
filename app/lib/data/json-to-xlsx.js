/**
 * JSON → XLSX. Yêu cầu input là mảng object (rows), key sẽ là header.
 *
 * @param {string} jsonText
 * @returns {Promise<Uint8Array>}
 */
export async function jsonToXlsx(jsonText) {
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch {
    throw new Error("JSON không hợp lệ — kiểm tra dấu phẩy, ngoặc, dấu nháy.");
  }
  if (!Array.isArray(data)) {
    throw new Error(
      "JSON phải là mảng (array) các đối tượng. Ví dụ: [{\"name\": \"...\", \"age\": 30}]"
    );
  }
  if (data.length === 0) {
    throw new Error("Mảng rỗng — không có gì để export.");
  }
  if (typeof data[0] !== "object" || data[0] === null || Array.isArray(data[0])) {
    throw new Error(
      "Mỗi phần tử trong mảng phải là object có key. Ví dụ: {\"name\": \"...\"}"
    );
  }

  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  return new Uint8Array(XLSX.write(wb, { type: "array", bookType: "xlsx" }));
}
