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

## ✅ Phase 1 — Tiện ích tiếng Việt ⭐ USP (XONG 04/06/2026, v0.7.0)

**Vì sao ưu tiên cao nhất:**
- 0 package mới — toàn bộ thuật toán là JS thuần ngắn (~50-220 dòng/tool)
- **Không có competitor** ở mảng này (ilovepdf, smallpdf không có)
- Cực mạnh cho SEO/content marketing: "công cụ duy nhất chuyển VNI sang Unicode online không cần upload"

**Đã ship:**
- [x] **Bỏ dấu tiếng Việt** ([/tools/bo-dau-tieng-viet](/tools/bo-dau-tieng-viet)) — 3 chế độ: bỏ dấu thường, URL slug, tên file an toàn. Real-time output.
- [x] **Đếm ký tự** ([/tools/dem-ky-tu](/tools/dem-ky-tu)) ⭐ — **thay cho "Đổi số ra chữ"** theo yêu cầu Ba Maya. Đếm ký tự/từ/dòng/đoạn/câu real-time, ước lượng thời gian đọc, top ký tự xuất hiện nhiều nhất. Hỗ trợ emoji + combining diacritics.
- [x] **VNI → Unicode** ([/tools/chuyen-vni-unicode](/tools/chuyen-vni-unicode)) — chuyển keystroke "Tie61ng Vie65t" → "Tiếng Việt". Bảng quy tắc + ví dụ click-to-try. **Beta**: chỉ keystroke cơ bản, đặt dấu trên ơ/ư phức tạp có thể lệch (sẽ refine ở Phase 1.1 nếu user feedback).
- [x] **Lịch âm ↔ dương** ([/tools/lich-am-duong](/tools/lich-am-duong)) — thuật toán Hồ Ngọc Đức port JS. 2 chiều, kèm Can Chi ngày/tháng/năm.

**Hạ tầng:**
- [x] Thư mục `app/lib/vietnamese/` — 4 lib độc lập, gom các tool text-only.
- [x] Pattern UI cho tool text-only: dùng ToolLayout + textarea, không cần ToolDropzone.

**Đề xuất Phase 1.1 (nếu có thời gian, không bắt buộc):**
- [ ] VNI → Unicode đầy đủ (xử lý đặt dấu trên ơ/ư chuẩn 100%)
- [ ] Thêm bảng mã TCVN3 → Unicode (font encoding cũ — cần bảng map full)
- [ ] Đổi số ra chữ tiếng Việt (đã dời khỏi Phase 1, đẩy sang ý tưởng tương lai)

---

## ✅ Phase 2 — Xử lý ảnh (XONG 04/06/2026, v0.8.0)

**Đã ship:**
- [x] **HEIC/HEIF → JPG** ([/tools/heic-sang-jpg](/tools/heic-sang-jpg)) — `heic2any` lazy load WebAssembly, batch convert, 3 preset chất lượng.
- [x] **Resize ảnh** ([/tools/resize-anh](/tools/resize-anh)) — Canvas API, 0 deps. Giữ tỉ lệ tự động, preset 75/50/25%.
- [x] **Nén ảnh** ([/tools/nen-anh](/tools/nen-anh)) — slider quality 10-100%, preview before/after.
- [x] **Ảnh → WebP** ([/tools/anh-sang-webp](/tools/anh-sang-webp)) — giảm ~25-50% so với JPG/PNG.

**Để Phase 3 hoặc sau:**
- [ ] Ghép nhiều ảnh thành 1 (collage) — grid 2x2, 3x3, horizontal/vertical

---

## ✅ Phase 3 — Office & Data interchange (XONG 04/06/2026, v0.9.0)

**Đã ship 6 tool:**
- [x] CSV → Excel, Excel → CSV (multi-sheet, BOM UTF-8)
- [x] Excel → JSON, JSON → Excel (validate array of objects)
- [x] Word → Markdown (`mammoth` + HTML→MD converter)
- [x] Markdown → PDF (`marked` + print dialog với CSS A4 đẹp)

**Để phase sau:**
- [ ] Markdown → Word — cần parser MD → docx phức tạp, defer
- [ ] PDF → Markdown nâng cao — heading detection thông minh hơn, table extraction

---

## 🗄️ Phase 3 — Office & Data (chi tiết gốc, đã ship)

- [ ] **CSV ↔ Excel** (`/tools/csv-sang-excel`, `/tools/excel-sang-csv`) — dùng `xlsx` đã có
- [ ] **Excel ↔ JSON** — flatten + nested
- [ ] **Word → Markdown** (`/tools/word-sang-md`) — dùng `mammoth` đã có + converter MD nội bộ
- [ ] **Markdown → PDF** (`/tools/md-sang-pdf`) — render MD → print
- [ ] **Markdown → Word** — `docx` đã có
- [ ] **PDF → Markdown nâng cao** (Phase B của tool đã có) — heading detection thông minh hơn, table extraction
- [ ] **Compare 2 PDF** — diff text, highlight phần khác

---

## ✅ Ngoài phase — EPUB → PDF (XONG 09/07/2026, v0.9.1)

Theo yêu cầu trực tiếp: chuyển kho sách Kindle/EPUB sang PDF.
- [x] **EPUB → PDF** ([/tools/epub-sang-pdf](/tools/epub-sang-pdf)) — parse ZIP bằng `DecompressionStream` native (0 package mới), đọc OPF, nhúng ảnh + bìa, in ra PDF A4.
- [ ] *(Ý tưởng sau)* Batch nhiều EPUB một lượt — hiện chặn vì popup blocker chỉ cho 1 cửa sổ in/lần.

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
