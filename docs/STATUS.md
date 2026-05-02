# STATUS.md — Tiến độ dự án

> File này là **file sống**: Ba Maya (hoặc Claude) cập nhật mỗi khi xong 1 milestone.
> Đọc file này đầu mỗi phiên dài để biết chính xác đang ở đâu.

## Cập nhật lần cuối
**02/05/2026** — Hot fix Footer: đổi link hệ sinh thái sang domain chính thức.

## Phiên bản hiện tại
`v0.4.3` — Footer + EcosystemBadge dùng URL giapkhampha.me thay vì giapkhamphame.vercel.app.

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
- [x] **Tool thứ hai: Ghép PDF** (Phase A — MVP)
  - [x] Drag & drop nhiều file PDF
  - [x] Sắp xếp bằng kéo thả + nút ↑↓ (mobile-friendly)
  - [x] Tùy chọn trang từng file với cú pháp `1-3, 5, 7-10`
  - [x] Logic shared: `lib/pdf-merge.js` (pdf-lib)
  - [x] Logic shared: `lib/parse-page-ranges.js` (đã test 14 case)
  - [x] Validate file PDF có mật khẩu, file hỏng — error tiếng Việt thân thiện
- [x] **Fix v0.4.1:** Xóa API route `/api/process` vi phạm cam kết privacy
- [x] **Fix v0.4.1:** Đồng nhất workerSrc pdfjs-dist sang `/pdf.worker.min.mjs`
- [x] **Setup domain chính thức (v0.4.2)**
  - [x] Mua giapkhampha.me ở Tenten (1 năm — 02/05/2026 đến 02/05/2027)
  - [x] Đăng ký Cloudflare account, dùng gói Free
  - [x] Đổi nameserver Tenten → Cloudflare (delilah.ns.cloudflare.com, tate.ns.cloudflare.com)
  - [x] Setup 3 DNS records: A @, CNAME www, CNAME pdf (đều DNS only)
  - [x] Add giapkhampha.me vào Vercel project giapkhamphame
  - [x] Add pdf.giapkhampha.me vào Vercel project pdf-viet
  - [x] SSL/HTTPS active qua Vercel (Let's Encrypt miễn phí)
  - [x] Redirect 308 từ pdf-viet.vercel.app → pdf.giapkhampha.me (giữ traffic cũ)
  - [x] Email Routing trên Cloudflare: lienhe@giapkhampha.me → Gmail
- [x] **Cleanup metadata sau setup domain (v0.4.2)**
  - [x] app/layout.js: metadataBase, openGraph, canonical → URL mới
  - [x] docs/CONTEXT.md: cập nhật URL hệ sinh thái và PDF Việt
  - [x] docs/STATUS.md: ghi nhận v0.4.2
- [x] **Hot fix Footer URL (v0.4.3)**
  - [x] Footer.jsx: đổi 4 cột link + CTA "Khám phá hệ sinh thái" sang giapkhampha.me (9 chỗ)
  - [x] pdf-sang-md/page.jsx: đổi link ecosystem badge sang giapkhampha.me (1 chỗ)
  - [x] Build + lint pass, deploy Vercel thành công

## 🚧 Đang làm
- [ ] *(trống — Phase A xong)*

## 📋 Đã lên lịch ngắn hạn (sprint hiện tại)
- [ ] **Tool: PDF → Word** — dùng `lib/pdf-extract.js` có sẵn + `docx` để tạo `.docx`
- [ ] **Header chung** — logo PDF Việt + nav tới các tool
- [ ] **Trang chủ** nâng cấp — giới thiệu + list tool đã có

## 🚫 Blocker / Câu hỏi mở
- [ ] ⚠️ **Favicon & OG image** riêng cho PDF Việt — **bắt buộc trước khi marketing** (hiện dùng favicon Next.js mặc định, OG image trống)
- [ ] Chiến lược **cache language data Tesseract** (10MB tiếng Việt) — Service Worker hay localforage?
- [x] ~~Cấu hình **worker `pdfjs-dist`** cho Next.js 16 App Router~~ — đã giải quyết hoàn toàn (v0.4.1: nhất quán `/pdf.worker.min.mjs` ở mọi nơi)
- [x] ~~Chưa quyết định **domain**~~ — đã xong: pdf.giapkhampha.me (v0.4.2)

---

## Lịch sử thay đổi quan trọng
| Ngày | Phiên bản | Thay đổi |
|---|---|---|
| 01/05/2026 | v0.1.0 | Khởi tạo dự án + bộ tài liệu |
| 01/05/2026 | v0.2.0 | Ra mắt tool PDF → Markdown (Phase A) + FileDropzone + lib/pdf-extract |
| 01/05/2026 | v0.2.1 | Fix escape ký tự đặc biệt quá đà trong PDF → Markdown |
| 01/05/2026 | v0.3.0 | Metadata SEO + favicon SVG + deploy preview Vercel |
| 01/05/2026 | v0.4.0 | Ra mắt tool Ghép PDF (Phase A) — drag-drop sắp xếp, tùy chọn trang từng file |
| 01/05/2026 | v0.4.1 | Fix critical: gỡ proxy stirling.tools, đồng nhất workerSrc pdfjs |
| 02/05/2026 | v0.4.2 | Domain chính thức pdf.giapkhampha.me + Cloudflare DNS + email forward (Tenten + Cloudflare Free) |
| 02/05/2026 | v0.4.3 | Hot fix Footer + EcosystemBadge: đổi toàn bộ link hệ sinh thái từ giapkhamphame.vercel.app → giapkhampha.me |

---

## Hướng dẫn cập nhật file này

Khi xong 1 việc:
1. Đánh dấu `[x]` ở dòng tương ứng (hoặc xoá nếu đã làm xong cả mục).
2. Đổi **"Cập nhật lần cuối"** ở trên đầu thành ngày hôm nay.
3. Nếu là thay đổi lớn (xong 1 phase, đổi tech, release version) → thêm dòng vào **"Lịch sử thay đổi"**.
4. Nếu blocker được giải quyết → di chuyển lên "Đã làm xong" hoặc xoá khỏi danh sách.

**Quy tắc:** mỗi phiên dài, Claude nên đọc file này đầu phiên và đề xuất cập nhật cuối phiên trước khi Ba Maya tắt máy.
