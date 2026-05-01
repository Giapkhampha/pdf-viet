# STATUS.md — Tiến độ dự án

> File này là **file sống**: Ba Maya (hoặc Claude) cập nhật mỗi khi xong 1 milestone.
> Đọc file này đầu mỗi phiên dài để biết chính xác đang ở đâu.

## Cập nhật lần cuối
**01/05/2026** — Deploy preview Vercel thành công, chuẩn bị production.

## Phiên bản hiện tại
`v0.3.0` — Metadata SEO, favicon, deploy preview Vercel.

---

## ✅ Đã làm xong
- [x] Khởi tạo Next.js 16 + React 19 + Tailwind v4
- [x] Cài đặt dependencies xử lý PDF/Word/Excel/OCR (`pdf-lib`, `pdfjs-dist`, `jspdf`, `mammoth`, `docx`, `xlsx`, `tesseract.js`)
- [x] Cấu hình ESLint, PostCSS, jsconfig (alias `@/*`)
- [x] Tạo bộ tài liệu dự án (CLAUDE.md + docs/)
- [x] Footer kết nối hệ sinh thái GIAP KHAMPHA (`app/components/Footer.jsx`)
- [x] Metadata SEO đầy đủ (OG, Twitter Card) + favicon SVG tạm
- [x] **Tool đầu tiên: PDF → Markdown** (Phase A — MVP)
  - [x] Component reusable: `FileDropzone.jsx`
  - [x] Logic shared: `lib/pdf-extract.js` (pdfjs-dist, tái dùng cho tool khác)
  - [x] Logic shared: `lib/format-markdown.js` (group lines/paragraphs, escape MD)
  - [x] Trang `/tools/pdf-sang-md` — drag & drop, options, preview, download, copy
  - [x] Worker `pdf.worker.min.mjs` copy vào `public/`
  - [x] Detect PDF scan → cảnh báo thân thiện

## 🚧 Đang làm
- [ ] *(trống — Phase A xong)*

## 📋 Đã lên lịch ngắn hạn (sprint hiện tại)
- [ ] **Tool: Ghép PDF** — `pdf-lib`, drag & drop nhiều file, sắp xếp thứ tự, export 1 file
- [ ] **Tool: PDF → Word** — dùng `lib/pdf-extract.js` có sẵn + `docx` để tạo `.docx`
- [ ] **Header chung** — logo PDF Việt + nav tới các tool
- [ ] **Trang chủ** nâng cấp — giới thiệu + list tool đã có

## 🚫 Blocker / Câu hỏi mở
- [ ] ⚠️ **Favicon & OG image** riêng cho PDF Việt — **bắt buộc trước khi deploy production thật sự** (hiện dùng favicon Next.js mặc định, OG image trống)
- [ ] Chưa quyết định **domain**: domain riêng hay subdomain `pdf.giapkhampha.me`?
- [ ] Chiến lược **cache language data Tesseract** (10MB tiếng Việt) — Service Worker hay localforage?
- [ ] ~~Cấu hình **worker `pdfjs-dist`** cho Next.js 16 App Router~~ — đã giải quyết (copy vào `public/`, lazy import)

---

## Lịch sử thay đổi quan trọng
| Ngày | Phiên bản | Thay đổi |
|---|---|---|
| 01/05/2026 | v0.1.0 | Khởi tạo dự án + bộ tài liệu |
| 01/05/2026 | v0.2.0 | Ra mắt tool PDF → Markdown (Phase A) + FileDropzone + lib/pdf-extract |
| 01/05/2026 | v0.2.1 | Fix escape ký tự đặc biệt quá đà trong PDF → Markdown |
| 01/05/2026 | v0.3.0 | Metadata SEO + favicon SVG + deploy preview Vercel |

---

## Hướng dẫn cập nhật file này

Khi xong 1 việc:
1. Đánh dấu `[x]` ở dòng tương ứng (hoặc xoá nếu đã làm xong cả mục).
2. Đổi **"Cập nhật lần cuối"** ở trên đầu thành ngày hôm nay.
3. Nếu là thay đổi lớn (xong 1 phase, đổi tech, release version) → thêm dòng vào **"Lịch sử thay đổi"**.
4. Nếu blocker được giải quyết → di chuyển lên "Đã làm xong" hoặc xoá khỏi danh sách.

**Quy tắc:** mỗi phiên dài, Claude nên đọc file này đầu phiên và đề xuất cập nhật cuối phiên trước khi Ba Maya tắt máy.
