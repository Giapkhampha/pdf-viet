# ROADMAP.md — Kế hoạch tính năng

> Roadmap không phải lời hứa — là **hướng đi**. Có thể đảo thứ tự nếu user feedback yêu cầu khác.

---

## 🎯 Phase 1 — MVP (mục tiêu: ra mắt được)
**Tiêu chí xong:** có 3-4 tool cơ bản dùng được, branding kết nối hệ sinh thái rõ ràng, deploy được lên Vercel.

- [ ] **Layout chung:** Header (logo + nav) + Footer (kết nối GIAP KHAMPHA)
- [ ] **Trang chủ:** giới thiệu, list tool, CTA "Khám phá hệ sinh thái"
- [ ] **Tool 1: Ghép PDF**
  - Drag & drop nhiều file PDF
  - Kéo thả để sắp xếp lại thứ tự
  - Export 1 file PDF duy nhất
  - Dùng `pdf-lib`
- [ ] **Tool 2: Tách PDF**
  - Tách theo trang hoặc khoảng trang (ví dụ: "1-3, 5, 7-10")
  - Export nhiều file PDF (zip nếu > 1)
  - Dùng `pdf-lib`
- [ ] **Tool 3: PDF → Word**
  - `pdfjs-dist` extract text từng trang
  - `docx` tạo file `.docx`
  - Cảnh báo: format có thể không 100% giống bản gốc
- [x] **Tool: PDF → Markdown** ⭐ (Phase A xong)
  - Input: PDF có text layer → Output: file `.md`
  - Dùng `lib/pdf-extract.js` (shared) + `lib/format-markdown.js`
  - Phase B (sau): heuristic heading detection, bold/italic, table
  - Phase C (sau): OCR cho PDF scan tiếng Việt
- [ ] **Trang Giới Thiệu / Về Ba Maya** — CTA dẫn về giapkhampha.me
- [ ] **Deploy Vercel** — domain `pdf-viet.vercel.app` hoặc subdomain riêng

---

## 🚀 Phase 2 — Mở rộng (mục tiêu: thật sự hữu dụng)
**Tiêu chí xong:** đủ tool để cover 80% nhu cầu xử lý PDF của ba mẹ Việt.

- [ ] **OCR PDF tiếng Việt** ⭐ (USP lớn nhất)
  - `tesseract.js` với `lang: "vie"`
  - Progress bar rõ ràng (OCR rất chậm với file lớn)
  - Cache language data sau lần đầu tải (~10MB)
  - Export text hoặc PDF có lớp text (searchable PDF)
- [ ] **Word → PDF** — `mammoth` đọc DOCX → render → `jspdf` export
- [ ] **Excel → PDF** — preview bảng → export PDF
- [ ] **Nén PDF** — giảm dung lượng (qua re-render hình ảnh ở DPI thấp hơn)
- [ ] **Watermark PDF** — text hoặc ảnh, chọn vị trí (góc, giữa, lặp lại)
- [ ] **Xoay & sắp xếp trang PDF** — UI trực quan kéo thả thumbnail từng trang
- [ ] **Trang Tutorial** — gif + text Việt cho mỗi tool

---

## 🌟 Phase 3 — Tối ưu & cộng đồng
**Tiêu chí xong:** PDF Việt là nơi ba mẹ Việt nghĩ tới đầu tiên khi cần xử lý PDF.

- [ ] **Đa ngôn ngữ:** thêm EN (target: ba mẹ Việt ở nước ngoài)
- [ ] **Lưu lịch sử cục bộ** (IndexedDB, không server) — user xem lại file đã xử lý
- [ ] **Plausible/Umami analytics** — privacy-friendly, không Google
- [ ] **PWA:** dùng được offline sau lần truy cập đầu
- [ ] **Cross-promote** với các sản phẩm khác trong hệ sinh thái (banner xoay vòng)
- [ ] **Chia sẻ Tool URL với param** — ví dụ `?files=2&action=merge` để share preset
- [ ] **Tích hợp Bé Ngoan Kawaii** — "Lưu chứng chỉ con vào Bé Ngoan Kawaii"

---

## 💡 Ý tưởng tương lai (chưa cam kết, chờ feedback)
- AI tóm tắt PDF tiếng Việt (gọi API, có cảnh báo upload — vi phạm nguyên tắc privacy nên cần bật/tắt rõ ràng)
- Tạo PDF từ template Việt (đơn xin nghỉ học, biên bản họp phụ huynh, …)
- Dịch PDF Anh → Việt giữ format
- "Trợ lý AI giải bài tập từ PDF" — chụp bài → giải

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
