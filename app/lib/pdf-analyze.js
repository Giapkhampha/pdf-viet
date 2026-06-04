import { extractTextFromPDF } from "@/app/lib/pdf-extract";
import { analyzeText } from "@/app/lib/vietnamese/count-chars";

const STOPWORDS_VI = new Set([
  "và", "của", "là", "các", "cho", "với", "này", "đó", "có", "không", "được",
  "trong", "đã", "sẽ", "thì", "mà", "nhưng", "hay", "hoặc", "nếu", "khi", "vì",
  "bị", "rồi", "lại", "nữa", "cũng", "chỉ", "đều", "rất", "hơn", "nhất", "đến",
  "từ", "ra", "vào", "lên", "xuống", "trên", "dưới", "sau", "trước", "bên",
  "tại", "ở", "về", "theo", "qua", "nó", "họ", "tôi", "bạn", "chúng", "ta",
  "the", "a", "an", "to", "of", "in", "is", "are", "was", "were", "be", "and",
  "or", "but", "if", "this", "that", "it", "for", "on", "at",
]);

/**
 * Phân tích PDF — trích text rồi gọi analyzeText + tìm top từ phổ biến
 * (đã loại stopwords tiếng Việt + Anh).
 */
export async function analyzePdf(file, onProgress) {
  onProgress?.("Đang đọc PDF...");
  const pages = await extractTextFromPDF(file);

  // Gộp tất cả text thành 1 string
  onProgress?.("Đang ghép văn bản...");
  const fullText = pages
    .flatMap((p) => p.items.map((it) => it.text))
    .join(" ");

  onProgress?.("Đang đếm...");
  const stats = analyzeText(fullText);

  // Top từ phổ biến — chỉ tính từ ≥ 2 ký tự, loại stopwords
  const wordCounts = new Map();
  const words = fullText.toLowerCase().match(/\p{L}+/gu) || [];
  for (const w of words) {
    if (w.length < 2 || STOPWORDS_VI.has(w)) continue;
    wordCounts.set(w, (wordCounts.get(w) || 0) + 1);
  }
  const topWords = [...wordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  return {
    pageCount: pages.length,
    stats,
    topWords,
    isLikelyScan: stats.chars < pages.length * 50, // < 50 ký tự/trang ≈ scan
  };
}
