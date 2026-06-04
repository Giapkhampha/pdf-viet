/**
 * Tools registry — nguồn duy nhất cho danh sách tool.
 * Trang chủ, dynamic route /tools/[slug], sitemap đều đọc từ đây.
 *
 * Trường:
 *   slug      — URL slug tiếng Việt không dấu (CONVENTIONS.md)
 *   title     — Tên hiển thị
 *   desc      — Mô tả ngắn dưới title
 *   icon      — Emoji hiển thị
 *   accent    — Tailwind color name (emerald | amber | teal | red | ...)
 *   category  — Nhóm để hiển thị trên trang chủ
 *   accept    — MIME / extension cho input
 *   multiple  — Cho phép chọn nhiều file
 *   status    — "ready" (chạy được) | "coming" (chưa có UI) | "stub" (chưa code)
 *   handler   — Tên hàm trong dynamic route /tools/[slug] (nếu dùng UI generic)
 *   customRoute — true nếu có route static riêng (ghep-pdf, pdf-sang-md)
 */

export const CATEGORIES = [
  { key: "convert-to-pdf",   title: "Chuyển sang PDF",          desc: "Từ Word/Excel/PowerPoint/Ảnh sang PDF" },
  { key: "convert-from-pdf", title: "Chuyển PDF sang định dạng khác", desc: "PDF sang Word/Excel/Markdown/Ảnh" },
  { key: "edit-pdf",         title: "Chỉnh sửa PDF",            desc: "Ghép, tách, xoay, nén, watermark..." },
  { key: "image-tools",      title: "Xử lý ảnh 📷",              desc: "HEIC→JPG, resize, nén, chuyển sang WebP" },
  { key: "office-data",      title: "Office & Dữ liệu 📊",       desc: "CSV ↔ Excel ↔ JSON, Word/Markdown chuyển đổi" },
  { key: "code-tools",       title: "Mã QR & Barcode 📱",       desc: "Tạo và đọc mã QR, sinh mã vạch in nhãn" },
  { key: "security",         title: "Bảo mật PDF",              desc: "Đặt và gỡ mật khẩu, làm phẳng" },
  { key: "ai-tools",         title: "Công cụ cho AI & OCR",     desc: "Trích xuất text cho ChatGPT, Claude, Gemini" },
  { key: "vietnamese",       title: "Tiện ích tiếng Việt 🌱",    desc: "Bảng mã VNI, bỏ dấu, đếm ký tự, lịch âm-dương" },
];

export const tools = [
  // ── Chuyển sang PDF ──────────────────────────────────────────────────────
  {
    slug: "word-sang-pdf",
    title: "Word sang PDF",
    desc: "Chuyển file .docx, .doc thành PDF qua hộp thoại in.",
    icon: "📄", accent: "blue", category: "convert-to-pdf",
    accept: ".docx,.doc", multiple: false, status: "ready",
    handler: "wordToPdf", note: "print",
  },
  {
    slug: "excel-sang-pdf",
    title: "Excel sang PDF",
    desc: "Chuyển bảng tính .xlsx, .xls, .csv thành PDF.",
    icon: "📊", accent: "emerald", category: "convert-to-pdf",
    accept: ".xlsx,.xls,.csv", multiple: false, status: "ready",
    handler: "excelToPdf", note: "print",
  },
  {
    slug: "html-sang-pdf",
    title: "HTML sang PDF",
    desc: "Chuyển trang web .html thành PDF qua hộp thoại in.",
    icon: "🌐", accent: "purple", category: "convert-to-pdf",
    accept: ".html,.htm", multiple: false, status: "ready",
    handler: "htmlToPdf", note: "print",
  },
  {
    slug: "anh-sang-pdf",
    title: "Ảnh sang PDF",
    desc: "Ghép nhiều ảnh JPG, PNG thành 1 file PDF.",
    icon: "🖼️", accent: "pink", category: "convert-to-pdf",
    accept: "image/*", multiple: true, status: "ready",
    handler: "imagesToPdf",
  },
  {
    slug: "ppt-sang-pdf",
    title: "PowerPoint sang PDF",
    desc: "Chuyển bài thuyết trình .pptx thành PDF — sắp có.",
    icon: "📑", accent: "orange", category: "convert-to-pdf",
    accept: ".pptx,.ppt", multiple: false, status: "stub",
  },

  // ── Chuyển PDF sang định dạng khác ───────────────────────────────────────
  {
    slug: "pdf-sang-md",
    title: "PDF sang Markdown",
    desc: "Chuyển PDF sang .md dùng với ChatGPT, Claude, Gemini.",
    icon: "📝", accent: "emerald", category: "convert-from-pdf",
    accept: "application/pdf", multiple: false, status: "ready",
    customRoute: true,
  },
  {
    slug: "pdf-sang-word",
    title: "PDF sang Word",
    desc: "Chuyển PDF thành file .docx có thể chỉnh sửa, giữ heading.",
    icon: "📝", accent: "blue", category: "convert-from-pdf",
    accept: "application/pdf", multiple: false, status: "ready",
    handler: "pdfToDocx",
  },
  {
    slug: "pdf-sang-excel",
    title: "PDF sang Excel",
    desc: "Trích xuất từng dòng text từ PDF ra file .xlsx.",
    icon: "📊", accent: "emerald", category: "convert-from-pdf",
    accept: "application/pdf", multiple: false, status: "ready",
    handler: "pdfToXlsx",
  },
  {
    slug: "pdf-sang-anh",
    title: "PDF sang Ảnh",
    desc: "Xuất từng trang PDF thành ảnh JPG độ phân giải cao.",
    icon: "🖼️", accent: "amber", category: "convert-from-pdf",
    accept: "application/pdf", multiple: false, status: "ready",
    handler: "pdfToImages",
  },

  // ── Chỉnh sửa PDF ────────────────────────────────────────────────────────
  {
    slug: "ghep-pdf",
    title: "Ghép PDF",
    desc: "Ghép nhiều PDF thành 1 file, chọn trang cụ thể, kéo thả sắp xếp.",
    icon: "🧩", accent: "teal", category: "edit-pdf",
    accept: "application/pdf", multiple: true, status: "ready",
    customRoute: true,
  },
  {
    slug: "tach-pdf",
    title: "Tách PDF",
    desc: "Tách PDF thành nhiều file nhỏ, mỗi trang 1 file.",
    icon: "✂️", accent: "red", category: "edit-pdf",
    accept: "application/pdf", multiple: false, status: "ready",
    handler: "splitPdf",
  },
  {
    slug: "nen-pdf",
    title: "Nén PDF",
    desc: "Giảm dung lượng file PDF qua tối ưu object stream.",
    icon: "🗜️", accent: "indigo", category: "edit-pdf",
    accept: "application/pdf", multiple: false, status: "ready",
    handler: "compressPdf",
  },
  {
    slug: "xoay-pdf",
    title: "Xoay PDF",
    desc: "Xoay toàn bộ trang PDF theo góc 90°, 180°, 270°.",
    icon: "🔄", accent: "cyan", category: "edit-pdf",
    accept: "application/pdf", multiple: false, status: "ready",
    handler: "rotatePdf", options: ["rotate"],
  },
  {
    slug: "watermark-pdf",
    title: "Thêm watermark",
    desc: "Thêm chữ đóng dấu chéo vào tất cả các trang PDF.",
    icon: "💧", accent: "gray", category: "edit-pdf",
    accept: "application/pdf", multiple: false, status: "ready",
    handler: "watermarkPdf", options: ["watermark"],
  },
  {
    slug: "so-trang-pdf",
    title: "Đánh số trang",
    desc: "Tự động thêm số trang dạng \"1 / N\" vào cuối mỗi trang.",
    icon: "🔢", accent: "violet", category: "edit-pdf",
    accept: "application/pdf", multiple: false, status: "ready",
    handler: "pageNumbers",
  },
  {
    slug: "xoa-trang-pdf",
    title: "Xoá trang PDF",
    desc: "Xoá các trang không cần (ví dụ: 1, 3, 5-7).",
    icon: "🗑️", accent: "red", category: "edit-pdf",
    accept: "application/pdf", multiple: false, status: "ready",
    handler: "deletePages", options: ["pageInput"],
  },
  {
    slug: "trich-trang-pdf",
    title: "Trích xuất trang PDF",
    desc: "Lấy ra một số trang cụ thể từ PDF.",
    icon: "📤", accent: "orange", category: "edit-pdf",
    accept: "application/pdf", multiple: false, status: "ready",
    handler: "extractPages", options: ["pageInput"],
  },
  {
    slug: "ky-pdf",
    title: "Ký PDF",
    desc: "Vẽ chữ ký bằng chuột/cảm ứng rồi nhúng vào trang cuối PDF.",
    icon: "✍️", accent: "purple", category: "edit-pdf",
    accept: "application/pdf", multiple: false, status: "ready",
    handler: "signPdf", options: ["signature"],
  },

  // ── Xử lý ảnh ────────────────────────────────────────────────────────────
  {
    slug: "heic-sang-jpg",
    title: "HEIC sang JPG",
    desc: "Chuyển ảnh HEIC/HEIF từ iPhone sang JPG dùng được trên Windows, web.",
    icon: "📷", accent: "pink", category: "image-tools",
    accept: ".heic,.heif", multiple: true, status: "ready",
  },
  {
    slug: "resize-anh",
    title: "Resize ảnh",
    desc: "Đổi kích thước ảnh JPG, PNG, WebP theo px hoặc %, giữ tỉ lệ tự động.",
    icon: "📐", accent: "cyan", category: "image-tools",
    accept: "image/*", multiple: false, status: "ready",
  },
  {
    slug: "nen-anh",
    title: "Nén ảnh",
    desc: "Giảm dung lượng ảnh JPG/PNG/WebP — tuỳ chỉnh chất lượng 1-100%.",
    icon: "🗜️", accent: "indigo", category: "image-tools",
    accept: "image/jpeg,image/png,image/webp", multiple: false, status: "ready",
  },
  {
    slug: "anh-sang-webp",
    title: "Ảnh sang WebP",
    desc: "Chuyển JPG, PNG sang WebP để giảm dung lượng ~25-50% mà gần như không mất chất lượng.",
    icon: "🌐", accent: "violet", category: "image-tools",
    accept: "image/jpeg,image/png", multiple: false, status: "ready",
  },

  // ── Office & Dữ liệu ─────────────────────────────────────────────────────
  {
    slug: "csv-sang-excel",
    title: "CSV sang Excel",
    desc: "Chuyển .csv thành .xlsx — giữ tiếng Việt UTF-8, dùng cho file xuất từ Google Sheets / Notion.",
    icon: "📊", accent: "emerald", category: "office-data",
    accept: ".csv,text/csv", multiple: false, status: "ready",
  },
  {
    slug: "excel-sang-csv",
    title: "Excel sang CSV",
    desc: "Chuyển .xlsx/.xls thành .csv UTF-8 với BOM (mở trong Excel không lỗi tiếng Việt). Hỗ trợ nhiều sheet.",
    icon: "📊", accent: "emerald", category: "office-data",
    accept: ".xlsx,.xls", multiple: false, status: "ready",
  },
  {
    slug: "excel-sang-json",
    title: "Excel sang JSON",
    desc: "Chuyển sheet Excel thành mảng JSON. Row 1 = key. Dùng cho dev import data API.",
    icon: "🔗", accent: "violet", category: "office-data",
    accept: ".xlsx,.xls", multiple: false, status: "ready",
  },
  {
    slug: "json-sang-excel",
    title: "JSON sang Excel",
    desc: "Chuyển mảng JSON (array of objects) thành file .xlsx — paste hoặc tải file .json.",
    icon: "🔗", accent: "violet", category: "office-data",
    accept: ".json,application/json", multiple: false, status: "ready",
  },
  {
    slug: "word-sang-md",
    title: "Word sang Markdown",
    desc: "Chuyển .docx thành Markdown để paste vào ChatGPT, Claude, Notion. Giữ heading, list, bảng.",
    icon: "📝", accent: "blue", category: "office-data",
    accept: ".docx,.doc", multiple: false, status: "ready",
  },
  {
    slug: "md-sang-pdf",
    title: "Markdown sang PDF",
    desc: "Render Markdown thành PDF qua cửa sổ in — giữ font tiếng Việt, hỗ trợ heading/bold/list/code/bảng.",
    icon: "📝", accent: "violet", category: "office-data",
    accept: ".md,.markdown", multiple: false, status: "ready",
  },

  // ── Mã QR & Barcode ──────────────────────────────────────────────────────
  {
    slug: "tao-qr",
    title: "Tạo mã QR",
    desc: "Tạo mã QR từ văn bản, URL, WiFi, vCard. Tải PNG độ phân giải cao.",
    icon: "📱", accent: "blue", category: "code-tools",
    accept: null, multiple: false, status: "ready",
  },
  {
    slug: "doc-qr",
    title: "Đọc mã QR",
    desc: "Tải ảnh có mã QR, decode ra text/URL/WiFi/vCard ngay trên trình duyệt.",
    icon: "🔍", accent: "emerald", category: "code-tools",
    accept: "image/*", multiple: false, status: "ready",
  },
  {
    slug: "tao-ma-vach",
    title: "Tạo mã vạch",
    desc: "Tạo mã vạch Code 128, Code 39, EAN-13, EAN-8 để in nhãn sản phẩm.",
    icon: "📊", accent: "violet", category: "code-tools",
    accept: null, multiple: false, status: "ready",
  },

  // ── AI & OCR (mở rộng) ────────────────────────────────────────────────────
  // Lưu ý: ocr-tieng-viet đã ở section "AI & OCR" gốc bên dưới. Thêm
  // phan-tich-pdf vào cùng category cho gọn.
  {
    slug: "phan-tich-pdf",
    title: "Phân tích PDF",
    desc: "Đếm trang, từ, ký tự, ước lượng thời gian đọc, top từ phổ biến nhất trong PDF.",
    icon: "🔍", accent: "cyan", category: "ai-tools",
    accept: "application/pdf", multiple: false, status: "ready",
  },

  // ── Bảo mật ──────────────────────────────────────────────────────────────
  {
    slug: "lam-phang-pdf",
    title: "Làm phẳng PDF",
    desc: "Chuyển PDF về dạng không chỉnh sửa được (đã ký xong).",
    icon: "📋", accent: "gray", category: "security",
    accept: "application/pdf", multiple: false, status: "ready",
    handler: "flattenPdf",
  },
  {
    slug: "khoa-pdf",
    title: "Đặt mật khẩu PDF",
    desc: "Đặt mật khẩu mở file cho PDF — sắp có.",
    icon: "🔒", accent: "red", category: "security",
    accept: "application/pdf", multiple: false, status: "stub",
  },
  {
    slug: "mo-khoa-pdf",
    title: "Gỡ mật khẩu PDF",
    desc: "Xoá mật khẩu khỏi PDF (cần biết mật khẩu) — sắp có.",
    icon: "🔓", accent: "emerald", category: "security",
    accept: "application/pdf", multiple: false, status: "stub",
  },

  // ── AI & OCR ─────────────────────────────────────────────────────────────
  {
    slug: "ocr-tieng-viet",
    title: "OCR — Nhận dạng chữ",
    desc: "Nhận dạng chữ tiếng Việt trong ảnh/PDF scan bằng Tesseract.",
    icon: "🔍", accent: "blue", category: "ai-tools",
    accept: "image/*", multiple: false, status: "ready",
    handler: "ocr", note: "ocr",
  },

  // ── Tiện ích tiếng Việt — sắp có (đẩy lên Phase 1) ──────────────────────
  {
    slug: "chuyen-vni-unicode",
    title: "Chuyển VNI → Unicode",
    desc: "Chuyển văn bản gõ bằng keystroke VNI (Tie61ng Vie65t) sang Unicode chuẩn.",
    icon: "🔤", accent: "amber", category: "vietnamese", status: "ready",
  },
  {
    slug: "bo-dau-tieng-viet",
    title: "Bỏ dấu tiếng Việt",
    desc: "Bỏ dấu \"Tiếng Việt\" → \"Tieng Viet\" để tạo URL slug, tên file.",
    icon: "✨", accent: "amber", category: "vietnamese", status: "ready",
  },
  {
    slug: "dem-ky-tu",
    title: "Đếm ký tự",
    desc: "Đếm ký tự, từ, dòng, đoạn, ước lượng thời gian đọc — real-time khi gõ.",
    icon: "📊", accent: "amber", category: "vietnamese", status: "ready",
  },
  {
    slug: "lich-am-duong",
    title: "Đổi lịch âm ↔ dương",
    desc: "Chuyển đổi ngày âm lịch và dương lịch theo lịch Việt Nam, kèm Can Chi.",
    icon: "🗓️", accent: "amber", category: "vietnamese", status: "ready",
  },
];

export function getToolBySlug(slug) {
  return tools.find((t) => t.slug === slug) ?? null;
}

export function getToolsByCategory(categoryKey) {
  return tools.filter((t) => t.category === categoryKey);
}

/**
 * Map slug cũ ở /tool/[id] (English ID) → slug mới tiếng Việt.
 * Dùng cho redirect 308 trong next.config.mjs để giữ link cũ.
 */
export const LEGACY_ID_TO_SLUG = {
  "merge":           "ghep-pdf",
  "split":           "tach-pdf",
  "compress":        "nen-pdf",
  "rotate":          "xoay-pdf",
  "watermark":       "watermark-pdf",
  "jpg-to-pdf":      "anh-sang-pdf",
  "pdf-to-jpg":      "pdf-sang-anh",
  "word-to-pdf":     "word-sang-pdf",
  "excel-to-pdf":    "excel-sang-pdf",
  "ppt-to-pdf":      "ppt-sang-pdf",
  "html-to-pdf":     "html-sang-pdf",
  "pdf-to-word":     "pdf-sang-word",
  "pdf-to-excel":    "pdf-sang-excel",
  "pdf-to-markdown": "pdf-sang-md",
  "protect":         "khoa-pdf",
  "unlock":          "mo-khoa-pdf",
  "delete-pages":    "xoa-trang-pdf",
  "extract-pages":   "trich-trang-pdf",
  "page-numbers":    "so-trang-pdf",
  "sign":            "ky-pdf",
  "flatten":         "lam-phang-pdf",
  "ocr":             "ocr-tieng-viet",
};
