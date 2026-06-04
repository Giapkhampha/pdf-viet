/**
 * Phân tích văn bản — đếm ký tự, từ, dòng, đoạn, câu, ước lượng thời gian đọc.
 *
 * Lưu ý tiếng Việt:
 *  - Dùng `[...text]` (spread iterator) để đếm đúng ký tự surrogate-pair (emoji)
 *    và combining diacritics — tránh `.length` đếm sai.
 *  - Từ: tách theo whitespace, hoạt động OK với tiếng Việt vì các âm tiết
 *    cách nhau bằng dấu cách.
 *  - Tốc độ đọc trung bình tiếng Việt: ~200 từ/phút (tương đương tiếng Anh).
 */

const WORDS_PER_MINUTE = 200;

export function analyzeText(text) {
  if (typeof text !== "string") text = "";

  const chars = [...text].length;
  const charsNoSpace = [...text.replace(/\s/g, "")].length;
  const bytes = new Blob([text]).size; // UTF-8 byte size

  const trimmed = text.trim();
  const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;

  const lines = text === "" ? 0 : text.split("\n").length;

  const paragraphs =
    trimmed === ""
      ? 0
      : text
          .split(/\n\s*\n/)
          .filter((p) => p.trim().length > 0)
          .length;

  const sentences =
    trimmed === ""
      ? 0
      : (trimmed.match(/[.!?]+(?=\s|$)/g) || []).length || 1;

  const readingSeconds = words === 0 ? 0 : Math.max(1, Math.round((words / WORDS_PER_MINUTE) * 60));

  return {
    chars,
    charsNoSpace,
    bytes,
    words,
    lines,
    paragraphs,
    sentences,
    readingSeconds,
  };
}

/**
 * Format thời gian đọc thành chuỗi thân thiện: "< 1 phút", "2 phút", "1 giờ 15 phút".
 */
export function formatReadingTime(seconds) {
  if (seconds === 0) return "—";
  if (seconds < 60) return "< 1 phút";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const remainMin = minutes % 60;
  return remainMin === 0 ? `${hours} giờ` : `${hours} giờ ${remainMin} phút`;
}

/**
 * Format size byte sang KB/MB.
 */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
