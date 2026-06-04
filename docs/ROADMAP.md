# ROADMAP.md — Kế hoạch tính năng

> Roadmap không phải lời hứa — là **hướng đi**. Có thể đảo thứ tự nếu user feedback yêu cầu khác.
>
> **Định vị mới (v0.5.0):** PDF Việt → *siêu app chuyển đổi file tiếng Việt*. Không chỉ PDF.

---

## ✅ Phase 0 — Dọn nhà (XONG 03/06/2026, v0.5.0)
Xem chi tiết trong `STATUS.md`. Tóm tắt: thống nhất 22 tool về 1 registry, dark theme đồng nhất, dynamic route `/tools/[slug]`, redirect 308 cho link cũ.

---

## ✅ Phase MVP — đã giao trước Phase 0
17 tool ready trên production: ghép/tách/nén/xoay/watermark PDF, đánh số trang, xoá/trích trang, ký PDF, làm phẳng, PDF↔Word↔Excel↔Markdown↔Ảnh, Word/Excel/HTML→PDF, OCR tiếng Việt. Xem `STATUS.md` cho danh sách đầy đủ.

---

## 🎯 Phase 1 — Tiện ích tiếng Việt ⭐ USP (đang khởi động)

**Vì sao ưu tiên cao nhất:**
- 0 package mới — toàn bộ thuật toán là JS thuần ngắn (~50-150 dòng/tool)
- **Không có competitor** ở mảng này (ilovepdf, smallpdf không có)
- Cực mạnh cho SEO/content marketing: "công cụ duy nhất chuyển VNI sang Unicode online không cần upload"
- Demo 30 giây, viral cao với target user Việt Nam

**Mục tiêu xong:** PDF Việt trở thành nơi user Việt nghĩ tới khi cần xử lý text tiếng Việt.

- [ ] **Chuyển bảng mã VNI/TCVN3/VIQR → Unicode** (`/tools/chuyen-vni-unicode`)
  - Bảng map có sẵn (open source) — copy vào `lib/vietnamese/encoding-maps.js`
  - UI: textarea input → textarea output, có nút detect bảng mã tự động
- [ ] **Bỏ dấu tiếng Việt** (`/tools/bo-dau-tieng-viet`)
  - Regex thuần, hàm ngắn 15 dòng
  - UI: textarea + option giữ/bỏ khoảng trắng, chuyển kebab/snake/camel
- [ ] **Đổi số ra chữ tiếng Việt** (`/tools/so-sang-chu`)
  - Dùng cho hợp đồng, hoá đơn — ví dụ: `1.500.000` → "Một triệu năm trăm nghìn đồng"
  - Hỗ trợ số âm, số thập phân, đơn vị (đồng/USD/...)
- [ ] **Đổi lịch âm ↔ dương** (`/tools/lich-am-duong`)
  - Thuật toán Hồ Ngọc Đức (~150 dòng JS, MIT)
  - UI: 2 date picker đồng bộ + hiển thị Can Chi, ngày trong năm âm

**Hạ tầng đi kèm:**
- [ ] Thư mục `app/lib/vietnamese/` — gom các tool text-only
- [ ] Variant ToolLayout dạng "text input" (không cần ToolDropzone) — đơn giản hơn

---

## 🚀 Phase 2 — Mở rộng nhóm Ảnh (target ba mẹ iPhone)

**Vì sao:** Ba mẹ Việt dùng iPhone gửi ảnh tài liệu cho con/giáo viên rất nhiều — HEIC khó dùng trên Windows/web. Đây là pain point thật.

- [ ] **HEIC/HEIF → JPG** (`/tools/heic-sang-jpg`)
  - Cần cài `heic2any` (~200KB) — xin Ba Maya duyệt
  - Batch convert nhiều ảnh, có ZIP output
- [ ] **Resize ảnh** (`/tools/resize-anh`)
  - Tự viết bằng Canvas API (0 deps mới) HOẶC `browser-image-compression` (~30KB)
  - Preset: 50%, 25%, custom px/percentage
- [ ] **Nén ảnh** (`/tools/nen-anh`)
  - Canvas re-encode với quality tuỳ chỉnh
  - Preview so sánh before/after
- [ ] **Ảnh → WebP** (`/tools/anh-sang-webp`) — giảm dung lượng trung bình 50%
- [ ] **Ghép nhiều ảnh thành 1 (collage)** — grid 2x2, 3x3, horizontal/vertical

---

## 📊 Phase 3 — Office & Data interchange

- [ ] **CSV ↔ Excel** (`/tools/csv-sang-excel`, `/tools/excel-sang-csv`) — dùng `xlsx` đã có
- [ ] **Excel ↔ JSON** — flatten + nested
- [ ] **Word → Markdown** (`/tools/word-sang-md`) — dùng `mammoth` đã có + converter MD nội bộ
- [ ] **Markdown → PDF** (`/tools/md-sang-pdf`) — render MD → print
- [ ] **Markdown → Word** — `docx` đã có
- [ ] **PDF → Markdown nâng cao** (Phase B của tool đã có) — heading detection thông minh hơn, table extraction
- [ ] **Compare 2 PDF** — diff text, highlight phần khác

---

## 🔍 Phase 4 — QR, mã vạch & media

- [ ] **QR Code tạo + đọc** (`/tools/qr-code`) — `qrcode` + `jsqr` (~50KB) — viral cao
- [ ] **Mã vạch** — `bwip-js` cho giáo viên in nhãn
- [ ] **MP4 → MP3** — `ffmpeg.wasm` lazy load (~30MB nhưng cache rất tốt)
- [ ] **MP4 → GIF** — cùng `ffmpeg.wasm`
- [ ] **Cắt audio/video đơn giản**
- [ ] **Đếm từ / phân tích tài liệu** — `pdfjs-dist` + thống kê

---

## 🌟 Phase 5 — Quality of life & cộng đồng

- [ ] **PWA + offline mode** — sau lần truy cập đầu dùng được không mạng
- [ ] **Lịch sử cục bộ** (IndexedDB) — user xem lại file đã xử lý
- [ ] **Plausible/Umami analytics** — privacy-friendly, không Google
- [ ] **Đa ngôn ngữ (EN)** — target ba mẹ Việt ở nước ngoài
- [ ] **Cross-promote** trong hệ sinh thái GIAP KHAMPHA (banner xoay vòng)
- [ ] **Chia sẻ tool URL với preset** — `?action=merge&pages=1-3`
- [ ] **Tích hợp Bé Ngoan Kawaii** — "Lưu chứng chỉ con vào Bé Ngoan Kawaii"

---

## 💡 Ý tưởng tương lai (chưa cam kết, chờ feedback)
- AI tóm tắt PDF tiếng Việt (gọi API, cảnh báo upload — cần bật/tắt rõ ràng)
- Tạo PDF từ template Việt (đơn xin nghỉ học, biên bản họp phụ huynh)
- Dịch PDF Anh → Việt giữ format
- "Trợ lý AI giải bài tập từ PDF"
- Đặt/Gỡ mật khẩu PDF (đang stub) — cần thư viện browser ổn định
- PowerPoint → PDF — cần thư viện browser ổn định

---

## 📐 Nguyên tắc khi chọn tính năng tiếp theo

Khi không chắc nên làm gì trước, hỏi 4 câu này:

1. **User Việt Nam dùng nhiều nhất không?** → Ưu tiên cao
2. **Có cần upload server không?** → Nếu CÓ → cân nhắc kỹ, có thể từ chối hoặc ẩn sau toggle
3. **Demo được trong 30 giây không?** → Tốt cho marketing/social
4. **Dùng thư viện đã có không?** → Ưu tiên, không cài thêm trừ khi không có cách khác

---

## 🚦 Nhịp release (đề xuất)

- **Mỗi tool xong → release ngay** (không gom batch). User có cảm giác sản phẩm đang sống.
- **Mỗi release** → đăng ngắn lên GIAP KHAMPHA (bài viết) + cross-link.
- **Mỗi tháng** → review STATUS, đảo thứ tự ROADMAP nếu cần.
