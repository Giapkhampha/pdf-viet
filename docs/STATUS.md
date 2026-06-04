# STATUS.md — Tiến độ dự án

> File này là **file sống**: Ba Maya (hoặc Claude) cập nhật mỗi khi xong 1 milestone.
> Đọc file này đầu mỗi phiên dài để biết chính xác đang ở đâu.

## Cập nhật lần cuối
**04/06/2026** — Phase 2 — Xử lý ảnh LIVE (4 tool: HEIC→JPG, resize, nén, sang WebP).

## Phiên bản hiện tại
`v0.8.0` — **Phase 2 hoàn tất**. 25 tool đã chạy được (17 PDF + 4 tiếng Việt + 4 ảnh). Trang chủ giờ có 7 category: thêm "Xử lý ảnh 📷" giữa Chỉnh sửa PDF và Bảo mật.

---

## 📷 Phase 2 — Xử lý ảnh (XONG 04/06/2026, v0.8.0)
> Target: ba mẹ Việt dùng iPhone gửi ảnh tài liệu — pain point HEIC không mở được trên Windows. Plus tool resize/nén/WebP cho người làm content.

- [x] **HEIC sang JPG** ([/tools/heic-sang-jpg](/tools/heic-sang-jpg)) — `lib/image/heic-to-jpg.js` (lazy load `heic2any` ~200KB WebAssembly). Batch convert nhiều file, 3 preset chất lượng, hiện % giảm dung lượng từng file.
- [x] **Resize ảnh** ([/tools/resize-anh](/tools/resize-anh)) — `lib/image/resize.js` (Canvas API, 0 deps). Input width/height + giữ tỉ lệ auto, preset 75%/50%/25%, preview kết quả + so sánh size.
- [x] **Nén ảnh** ([/tools/nen-anh](/tools/nen-anh)) — `lib/image/compress.js`. Slider quality 10-100%, preview before/after dung lượng. Cảnh báo PNG lossless → gợi ý WebP.
- [x] **Ảnh sang WebP** ([/tools/anh-sang-webp](/tools/anh-sang-webp)) — `lib/image/to-webp.js`. Quality slider 20-100%, hiện % giảm dung lượng so với JPG/PNG gốc.

**Hạ tầng đi kèm:**
- [x] `app/lib/image/_shared.js` — helper chung: `loadImage`, `releaseImage`, `canvasToBlob`, `getImageDimensions`, `formatBytes`, `replaceExtension`.
- [x] Category mới `image-tools` trong registry — đặt giữa Chỉnh sửa PDF và Bảo mật.
- [x] Format-map: 4 tool gắn vào planet JPG + PNG → click vào 2 planet này trên trang chủ sẽ thấy đầy đủ tool ảnh.
- [x] Package mới: `heic2any@^0.0.4` (lazy load, không bloat bundle).

---

## 🌱 Phase 1 — Tiện ích tiếng Việt (XONG 04/06/2026, v0.7.0)
> USP rõ nhất của app: không competitor + 0 package mới. Tool text-only nên UX khác PDF tool — dùng textarea + real-time output thay vì dropzone.

- [x] **Bỏ dấu tiếng Việt** ([/tools/bo-dau-tieng-viet](/tools/bo-dau-tieng-viet)) — `lib/vietnamese/remove-diacritics.js`. 3 chế độ: bỏ dấu thường, URL slug, tên file an toàn. Real-time output.
- [x] **Đếm ký tự** ([/tools/dem-ky-tu](/tools/dem-ky-tu)) — `lib/vietnamese/count-chars.js`. Đếm ký tự (kể cả emoji), từ, dòng, đoạn, câu, ước lượng thời gian đọc 200 từ/phút, kích thước UTF-8, top 5 ký tự xuất hiện nhiều nhất. **Thay cho "Đổi số ra chữ"** theo yêu cầu Ba Maya.
- [x] **VNI → Unicode** ([/tools/chuyen-vni-unicode](/tools/chuyen-vni-unicode)) — `lib/vietnamese/vni-to-unicode.js`. Chuyển keystroke "Tie61ng Vie65t" → "Tiếng Việt". Bảng quy tắc collapsible + 4 ví dụ click-to-try. **Phiên bản beta**: chỉ keystroke cơ bản, đặt dấu trên ơ/ư phức tạp có thể lệch.
- [x] **Lịch âm ↔ dương** ([/tools/lich-am-duong](/tools/lich-am-duong)) — `lib/vietnamese/lunar-calendar.js`. Thuật toán Hồ Ngọc Đức (~220 dòng) port sang JS thuần. 2 chiều: dương→âm (native date picker), âm→dương (3 input + checkbox nhuận). Kèm Can Chi ngày/tháng/năm.

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

**Tiện ích tiếng Việt 🌱 (4):** xem section "Phase 1" ở trên — bỏ dấu, đếm ký tự, VNI→Unicode, lịch âm-dương.

### Stub đang đợi (3 tool)
- [ ] PowerPoint → PDF — chưa có thư viện browser-native ổn định
- [ ] Đặt mật khẩu PDF — cần khảo sát thư viện
- [ ] Gỡ mật khẩu PDF — cần khảo sát thư viện

---

## 🚧 Đang làm
- [ ] *(trống — sẵn sàng cho Phase 3)*

## 📋 Sprint tiếp theo (Phase 3 — Office & Data)
- [ ] **CSV ↔ Excel** (`/tools/csv-sang-excel`, `/tools/excel-sang-csv`) — dùng `xlsx` đã có
- [ ] **Excel ↔ JSON**
- [ ] **Word → Markdown** — `mammoth` đã có
- [ ] **Markdown → PDF / Word**
- [ ] **PDF → Markdown nâng cao** (heading detection thông minh hơn, table extraction)
- [ ] **Ghép nhiều ảnh thành 1 (collage)** — leftover từ Phase 2, scope nhỏ

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
| 04/06/2026 | **v0.7.0** | **Phase 1 — Tiện ích tiếng Việt LIVE**: bỏ dấu (3 chế độ), đếm ký tự (thay cho "đổi số ra chữ" theo yêu cầu Ba Maya), VNI→Unicode beta, lịch âm-dương (thuật toán Hồ Ngọc Đức + Can Chi). Click TXT planet trên trang chủ giờ hiện 4 tool ready. |
| 04/06/2026 | **v0.8.0** | **Phase 2 — Xử lý ảnh LIVE**: HEIC→JPG (heic2any lazy load), Resize ảnh (Canvas + giữ tỉ lệ), Nén ảnh (slider quality), Ảnh→WebP (giảm ~30%). Thêm category mới "Xử lý ảnh 📷". 25 tool ready. |

---

## Hướng dẫn cập nhật file này

Khi xong 1 việc:
1. Đánh dấu `[x]` ở dòng tương ứng (hoặc xoá nếu đã làm xong cả mục).
2. Đổi **"Cập nhật lần cuối"** ở trên đầu thành ngày hôm nay.
3. Nếu là thay đổi lớn (xong 1 phase, đổi tech, release version) → thêm dòng vào **"Lịch sử thay đổi"**.
4. Nếu blocker được giải quyết → di chuyển lên "Đã làm xong" hoặc xoá khỏi danh sách.

**Quy tắc:** mỗi phiên dài, Claude nên đọc file này đầu phiên và đề xuất cập nhật cuối phiên trước khi Ba Maya tắt máy.
