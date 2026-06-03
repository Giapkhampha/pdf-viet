// Mapping slug cũ /tool/<english-id> → slug mới /tools/<vietnamese-slug>.
// Inline ở đây thay vì import từ app/lib/tools-registry.js để tránh
// MODULE_TYPELESS_PACKAGE_JSON warning khi Node parse next.config.mjs.
// Nếu thay đổi → cập nhật song song với LEGACY_ID_TO_SLUG trong tools-registry.js.
const LEGACY_REDIRECTS = {
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

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return Object.entries(LEGACY_REDIRECTS).map(([oldId, newSlug]) => ({
      source: `/tool/${oldId}`,
      destination: `/tools/${newSlug}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
