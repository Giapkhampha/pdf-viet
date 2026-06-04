import { tools } from "@/app/lib/tools-registry";

/**
 * Format = một "định dạng file" (PDF, WORD, EXCEL…). Mỗi format là 1 quả cầu
 * trong CosmicHero. Click vào quả cầu → mở modal liệt kê tool liên quan.
 *
 * `accent` phải khớp với PLANET_COLORS trong PlanetIcon.jsx để hành tinh và
 * card trong modal có tông màu nhất quán.
 */
export const FORMATS = {
  pdf:   { key: "pdf",   label: "PDF",   accent: "pink",    description: "Tài liệu PDF — định dạng trung tâm." },
  word:  { key: "word",  label: "WORD",  accent: "blue",    description: "Microsoft Word (.docx, .doc)." },
  excel: { key: "excel", label: "EXCEL", accent: "emerald", description: "Bảng tính Excel (.xlsx, .xls, .csv)." },
  ppt:   { key: "ppt",   label: "PPT",   accent: "red",     description: "PowerPoint (.pptx)." },
  jpg:   { key: "jpg",   label: "JPG",   accent: "amber",   description: "Ảnh JPG / JPEG." },
  png:   { key: "png",   label: "PNG",   accent: "violet",  description: "Ảnh PNG có nền trong." },
  html:  { key: "html",  label: "HTML",  accent: "indigo",  description: "Trang web .html." },
  md:    { key: "md",    label: "MD",    accent: "violet",  description: "Markdown — chuẩn để paste vào ChatGPT, Claude." },
  txt:   { key: "txt",   label: "TXT",   accent: "cyan",    description: "Văn bản thuần + tiện ích xử lý text tiếng Việt." },
};

/**
 * Map slug → formats[] (input/output liên quan).
 * Một tool có thể thuộc nhiều format (vd "anh-sang-pdf" liên quan JPG+PNG+PDF).
 */
const SLUG_TO_FORMATS = {
  // Chuyển sang PDF
  "word-sang-pdf":   ["word", "pdf"],
  "excel-sang-pdf":  ["excel", "pdf"],
  "html-sang-pdf":   ["html", "pdf"],
  "anh-sang-pdf":    ["jpg", "png", "pdf"],
  "ppt-sang-pdf":    ["ppt", "pdf"],

  // Chuyển từ PDF
  "pdf-sang-md":     ["pdf", "md"],
  "pdf-sang-word":   ["pdf", "word"],
  "pdf-sang-excel":  ["pdf", "excel"],
  "pdf-sang-anh":    ["pdf", "jpg", "png"],

  // Chỉnh sửa PDF — chỉ liên quan PDF
  "ghep-pdf":        ["pdf"],
  "tach-pdf":        ["pdf"],
  "nen-pdf":         ["pdf"],
  "xoay-pdf":        ["pdf"],
  "watermark-pdf":   ["pdf"],
  "so-trang-pdf":    ["pdf"],
  "xoa-trang-pdf":   ["pdf"],
  "trich-trang-pdf": ["pdf"],
  "ky-pdf":          ["pdf"],

  // Bảo mật
  "lam-phang-pdf":   ["pdf"],
  "khoa-pdf":        ["pdf"],
  "mo-khoa-pdf":     ["pdf"],

  // OCR — nhận input ảnh hoặc PDF
  "ocr-tieng-viet":  ["jpg", "png", "pdf"],

  // Tiện ích tiếng Việt — text-only nên gom vào TXT
  "chuyen-vni-unicode": ["txt"],
  "bo-dau-tieng-viet":  ["txt"],
  "so-sang-chu":        ["txt"],
  "lich-am-duong":      ["txt"],
};

/**
 * @param {string} formatKey — key trong FORMATS (vd "pdf")
 * @returns {Array} tools (kèm thêm trường _formats) có liên quan format đó,
 *   sắp xếp tool ready trước, stub sau.
 */
export function getToolsByFormat(formatKey) {
  const matched = tools
    .map((t) => ({ ...t, _formats: SLUG_TO_FORMATS[t.slug] ?? [] }))
    .filter((t) => t._formats.includes(formatKey));

  // ready trước, stub sau
  return matched.sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === "ready" ? -1 : 1;
  });
}

/** Danh sách format hiển thị trên cosmic hero, theo đúng vị trí trong ảnh. */
export const HERO_FORMAT_KEYS = ["pdf", "word", "excel", "ppt", "jpg", "html", "png", "md", "txt"];
