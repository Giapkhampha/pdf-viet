/**
 * Parse chuỗi range trang kiểu "1-3, 5, 7-10" thành mảng số trang (1-indexed).
 *
 * Quy tắc:
 *  - Cho phép khoảng trắng tự do giữa các phần.
 *  - "all", "tất cả", chuỗi rỗng → trả về null (= lấy tất cả).
 *  - Range "1-3" → [1, 2, 3]. "3-1" → [1, 2, 3] (tự đảo nếu user gõ ngược).
 *  - Số đơn lẻ "5" → [5].
 *  - Loại trùng lặp, sort tăng dần.
 *  - Bỏ qua trang vượt totalPages, không throw.
 *  - Throw Error tiếng Việt nếu cú pháp sai (ký tự lạ, range không phải số).
 *
 * @param {string} input - Chuỗi range người dùng nhập
 * @param {number} totalPages - Tổng số trang của PDF
 * @returns {number[] | null} - Mảng số trang (1-indexed) hoặc null nếu lấy tất cả
 */
export function parsePageRanges(input, totalPages) {
  if (input == null) return null;
  const trimmed = String(input).trim().toLowerCase();
  if (trimmed === "" || trimmed === "all" || trimmed === "tất cả") {
    return null;
  }

  // Cho phép số, dấu trừ, dấu phẩy, khoảng trắng
  if (!/^[\d\s,\-]+$/.test(trimmed)) {
    throw new Error(
      'Phạm vi trang không hợp lệ. Bạn nhập theo dạng: 1-3, 5, 7-10'
    );
  }

  const parts = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return null;

  const pages = new Set();
  for (const part of parts) {
    if (part.includes("-")) {
      const segs = part.split("-").map((s) => s.trim());
      if (segs.length !== 2 || segs[0] === "" || segs[1] === "") {
        throw new Error(`Phạm vi "${part}" không hợp lệ. Ví dụ đúng: 1-3`);
      }
      const a = Number(segs[0]);
      const b = Number(segs[1]);
      if (!Number.isInteger(a) || !Number.isInteger(b) || a < 1 || b < 1) {
        throw new Error(`Phạm vi "${part}" không hợp lệ. Số trang phải >= 1.`);
      }
      const [start, end] = a <= b ? [a, b] : [b, a];
      for (let i = start; i <= end; i++) {
        if (i <= totalPages) pages.add(i);
      }
    } else {
      const n = Number(part);
      if (!Number.isInteger(n) || n < 1) {
        throw new Error(`Số trang "${part}" không hợp lệ.`);
      }
      if (n <= totalPages) pages.add(n);
    }
  }

  const result = Array.from(pages).sort((a, b) => a - b);
  if (result.length === 0) {
    throw new Error(
      `Không có trang nào hợp lệ. File này chỉ có ${totalPages} trang.`
    );
  }
  return result;
}
