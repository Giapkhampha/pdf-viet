# STATUS.md — Tiến độ dự án

> File này là **file sống**: Ba Maya (hoặc Claude) cập nhật mỗi khi xong 1 milestone.
> Đọc file này đầu mỗi phiên dài để biết chính xác đang ở đâu.

## Cập nhật lần cuối
**04/06/2026** — Cosmic UI + click quả cầu mở modal chọn công cụ chuyển đổi, deploy production thay code Phase A.

## Phiên bản hiện tại
`v0.6.1` — **Cosmic UI + Interactive Planets LIVE** ở https://pdf.giapkhampha.me. Click vào quả cầu hành tinh (PDF/WORD/EXCEL/...) → modal hiển thị tool chuyển đổi liên quan định dạng đó.

---

## 🪐 v0.6.x — Cosmic UI + Interactive Planets (XONG 04/06/2026)
- [x] **CosmicHero** với 9 hành tinh SVG (PDF/WORD/EXCEL/PPT/JPG/PNG/HTML/MD/TXT) float quanh title trung tâm — `PlanetIcon` SVG gradient + facet + halo, 10 màu preset.
- [x] **CosmicBackground** — gradient nebula + sao tĩnh + 5 sao twinkle nhấp nháy + 2 nebula cloud drift ngang.
- [x] **Header dark** với `CrystalLogo` SVG kim cương + gradient text "PDF Việt"; bỏ "Bảng giá"/"Đăng nhập" theo cam kết miễn phí + không backend.
- [x] **Click quả cầu → mở FormatModal** (v0.6.1):
  - `app/lib/format-map.js` — 9 FORMATS + `SLUG_TO_FORMATS` + `getToolsByFormat(key)`.
  - `FormatModal.jsx` client, `createPortal(document.body)`, ESC + click outside để đóng, lock body scroll, animation fade+scale.
  - Grid card 2 cột, link tới `/tools/<slug>`, stub hiển thị "Sắp có".
  - Tooltip "Bấm để xem công cụ" khi hover planet (discoverability).
- [x] **Animation `prefers-reduced-motion`** — disable float/twinkle/glow khi user bật.
- [x] **Production deploy** 04/06/2026 — https://pdf.giapkhampha.me thay code Phase A. Branch backup `archive/phase-a-2026-05-02` giữ history nếu cần restore.

---

## 🏗️ Phase 0 — Dọn nhà (XONG 03/06/2026)
- [x] **Tools registry tập trung** (`app/lib/tools-registry.js`) — 22 tool có slug tiếng Việt, category, status; nguồn duy nhất cho trang chủ, route, sitemap.
- [x] **Tách 17 lib** từ `/tool/[id]/page.js` 818 dòng → 17 file `app/lib/*.js` (mỗi handler 1 file ngắn ~30-60 dòng).
- [x] **Component dùng chung dark theme:** `ToolLayout`, `ToolDropzone` (controlled, có drag-reorder + up/down + xoá), `SignaturePad`, `EcosystemBadge`, `Header`.
- [x] **Trang chủ rebuild** — dark theme, nhóm tool theo 6 category (Chuyển sang PDF, Chuyển từ PDF, Chỉnh sửa, Bảo mật, AI/OCR, **Tiện ích tiếng Việt** 🌱), hiển thị "Sắp có" cho stub.
- [x] **Header chung** trong root layout — logo PDF Việt + badge "Miễn phí 100%" + link GIAP KHAMPHA.
- [x] **Dynamic route** `app/tools/[slug]/page.jsx` — render đồng nhất 17 tool đơn giản qua `ToolLayout` + `ToolDropzone` + dispatch handler.
- [x] **Refactor 2 tool static** (`ghep-pdf`, `pdf-sang-md`) wrap bằng `ToolLayout` — nhất quán breadcrumb + badge.
- [x] **Redirect 308** trong `next.config.mjs` — `/tool/<old-id>` → `/tools/<vietnamese-slug>` cho mọi slug cũ (giữ SEO + link đã share).
- [x] **Xoá** `/tool/[id]` cũ (file 818 dòng).

---

## ✅ Đã làm xong (tích luỹ)

### Hạ tầng & branding
- [x] Khởi tạo Next.js 16 + React 19 + Tailwind v4
- [x] Cài đặt deps xử lý file (`pdf-lib`, `pdfjs-dist`, `jspdf`, `mammoth`, `docx`, `xlsx`, `tesseract.js`)
- [x] Cấu hình ESLint, PostCSS, jsconfig (alias `@/*`)
- [x] Bộ tài liệu dự án (CLAUDE.md + docs/)
- [x] **Footer** kết nối hệ sinh thái GIAP KHAMPHA
- [x] **Header chung dark theme** ✨ (v0.5.0)
- [x] **Trang chủ dark theme + group theo category** ✨ (v0.5.0)
- [x] Metadata SEO đầy đủ (OG, Twitter Card)
- [x] **Domain chính thức** https://pdf.giapkhampha.me (Cloudflare DNS + Vercel + 308 redirect từ pdf-viet.vercel.app)
- [x] Email forward `lienhe@giapkhampha.me` → Gmail

### Tool đã chạy được (17 tool)
> Tất cả accessible qua `/tools/<slug>`. UI dark theme đồng nhất, badge hệ sinh thái, breadcrumb.

**Chuyển sang PDF (4):**
- [x] [Word → PDF](/tools/word-sang-pdf) — `mammoth` → HTML → print dialog
- [x] [Excel → PDF](/tools/excel-sang-pdf) — `xlsx` → HTML table → print dialog
- [x] [HTML → PDF](/tools/html-sang-pdf) — print dialog
- [x] [Ảnh → PDF](/tools/anh-sang-pdf) — `pdf-lib` embed JPG/PNG

**Chuyển PDF sang định dạng khác (4):**
- [x] [PDF → Markdown](/tools/pdf-sang-md) — UI custom (`lib/format-markdown.js`)
- [x] [PDF → Word](/tools/pdf-sang-word) — `lib/pdf-structured-extract.js` + `docx`, có heading detection
- [x] [PDF → Excel](/tools/pdf-sang-excel) — text từng dòng → row trong `.xlsx`
- [x] [PDF → Ảnh](/tools/pdf-sang-anh) — `pdfjs-dist` render canvas → JPEG 2x scale

**Chỉnh sửa PDF (8):**
- [x] [Ghép PDF](/tools/ghep-pdf) — UI custom (drag-reorder + per-file page ranges)
- [x] [Tách PDF](/tools/tach-pdf) — mỗi trang 1 file
- [x] [Nén PDF](/tools/nen-pdf) — re-save với object streams
- [x] [Xoay PDF](/tools/xoay-pdf) — 90/180/270°
- [x] [Watermark PDF](/tools/watermark-pdf) — chéo 45°, font Helvetica (chưa hỗ trợ dấu)
- [x] [Đánh số trang](/tools/so-trang-pdf) — "N / Tổng" giữa dưới
- [x] [Xoá trang PDF](/tools/xoa-trang-pdf) — input "1, 3, 5-7"
- [x] [Trích xuất trang PDF](/tools/trich-trang-pdf) — input "1, 3, 5-7"
- [x] [Ký PDF](/tools/ky-pdf) — vẽ chữ ký canvas → nhúng PNG trang cuối

**Bảo mật (1 ready / 3 trong nhóm):**
- [x] [Làm phẳng PDF](/tools/lam-phang-pdf)
- [ ] Đặt mật khẩu PDF (stub) — cần thư viện ngoài, ẩn "Sắp có"
- [ ] Gỡ mật khẩu PDF (stub) — cần API native, ẩn "Sắp có"

**AI & OCR (1):**
- [x] [OCR tiếng Việt](/tools/ocr-tieng-viet) — `tesseract.js` `vie+eng`, ~20MB model lần đầu

### Stub đang đợi (5 tool)
- [ ] PowerPoint → PDF — chưa có thư viện browser-native
- [ ] Đặt/Gỡ mật khẩu PDF — như trên
- [ ] **Tiện ích tiếng Việt 🌱 ×4** — VNI/TCVN3 → Unicode, Bỏ dấu, Số ra chữ, Lịch âm-dương (đẩy lên **Phase 1**, xem ROADMAP)

---

## 🚧 Đang làm
- [ ] *(trống — chuẩn bị khởi động Phase 1: Tiện ích tiếng Việt)*

## 📋 Sprint tiếp theo (Phase 1 — Tiện ích tiếng Việt)
> Đã đẩy lên thay vì để Phase 2 — đây là USP rõ nhất, 0 package mới, không competitor.
- [ ] **Chuyển VNI/TCVN3 → Unicode** — bảng map có sẵn, copy paste vào `lib/vietnamese/vni-to-unicode.js`
- [ ] **Bỏ dấu tiếng Việt** — regex thuần, hàm ngắn
- [ ] **Đổi số ra chữ tiếng Việt** — thuật toán có sẵn, ~100 dòng
- [ ] **Đổi lịch âm ↔ dương** — thuật toán Hồ Ngọc Đức, ~150 dòng
- [ ] **Nhánh `lib/vietnamese/`** — tổ chức gọn cho các tool text-only (không cần ToolDropzone)

## 🚫 Blocker / Câu hỏi mở
- [ ] ⚠️ **Favicon & OG image** riêng cho PDF Việt — **bắt buộc trước khi marketing rộng** (hiện dùng favicon Next.js mặc định, OG image trống)
- [ ] Watermark + đánh số trang **chưa hỗ trợ tiếng Việt có dấu** (font Helvetica). Cần embed font Unicode (Noto/Roboto) — Phase 2.
- [ ] Chiến lược **cache language data Tesseract** (~20MB) — Service Worker hay localforage? — chưa quyết.
- [x] ~~Hai hệ thống tool song song (`/tool/[id]` vs `/tools/<slug>`)~~ — đã thống nhất (v0.5.0)
- [x] ~~Trang chủ vi phạm CONTEXT.md (light theme, footer riêng)~~ — đã sửa (v0.5.0)

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
| 02/05/2026 | v0.4.2 | Domain chính thức pdf.giapkhampha.me + Cloudflare DNS + email forward |
| 02/05/2026 | v0.4.3 | Hot fix Footer + EcosystemBadge: đổi link hệ sinh thái → giapkhampha.me |
| 03/06/2026 | **v0.5.0** | **Phase 0 dọn nhà**: tái cấu trúc 17 tool về `/tools/[slug]` + registry + dark theme đồng nhất, đẩy nhóm Tiện ích tiếng Việt lên Phase 1 |
| 04/06/2026 | **v0.6.0** | **Cosmic UI**: CosmicHero 9 hành tinh SVG float, CosmicBackground nebula+sao, CrystalLogo, Header redesign. Deploy preview Vercel — PR #1 merged. |
| 04/06/2026 | **v0.6.1** | **Click quả cầu mở FormatModal**: lọc tool theo định dạng (PDF/WORD/EXCEL/...), createPortal + ESC + click outside để đóng. **Deploy production** thay code Phase A — pdf.giapkhampha.me LIVE. Backup `archive/phase-a-2026-05-02`. |

---

## Hướng dẫn cập nhật file này

Khi xong 1 việc:
1. Đánh dấu `[x]` ở dòng tương ứng (hoặc xoá nếu đã làm xong cả mục).
2. Đổi **"Cập nhật lần cuối"** ở trên đầu thành ngày hôm nay.
3. Nếu là thay đổi lớn (xong 1 phase, đổi tech, release version) → thêm dòng vào **"Lịch sử thay đổi"**.
4. Nếu blocker được giải quyết → di chuyển lên "Đã làm xong" hoặc xoá khỏi danh sách.

**Quy tắc:** mỗi phiên dài, Claude nên đọc file này đầu phiên và đề xuất cập nhật cuối phiên trước khi Ba Maya tắt máy.
