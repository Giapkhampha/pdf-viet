/**
 * Bỏ dấu tiếng Việt — "Tiếng Việt" → "Tieng Viet".
 *
 * Dùng Unicode NFD normalize để tách combining diacritics khỏi vowel,
 * rồi strip range U+0300..U+036F. Riêng đ/Đ không thuộc combining nên
 * cần thay tay.
 */
export function removeDiacritics(text) {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/**
 * Tạo URL slug từ text tiếng Việt: bỏ dấu, lowercase, thay khoảng trắng
 * thành gạch nối, gỡ ký tự không hợp lệ.
 */
export function toUrlSlug(text) {
  return removeDiacritics(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Tên file an toàn: giữ chữ + số + một số ký tự đặc biệt được phép.
 */
export function toSafeFileName(text) {
  return removeDiacritics(text)
    .trim()
    .replace(/[^a-zA-Z0-9._-\s]/g, "")
    .replace(/\s+/g, "_");
}
