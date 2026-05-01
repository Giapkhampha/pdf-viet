# Báo cáo kiểm tra chức năng — PDF Việt

> Ngày kiểm tra: **01/05/2026** | Phiên bản: **v0.4.0** | Thực hiện: Claude Code

---

## Tóm tắt nhanh

| Hạng mục | Kết quả |
|---|---|
| Build production | ✅ Pass |
| Lint | ✅ Pass |
| Tool hoạt động đầy đủ | 16 / 22 |
| Tool hoạt động một phần | 4 / 22 |
| Tool chưa implement | 2 / 22 (protect, unlock) |
| Vấn đề nghiêm trọng | 2 (xem mục §6) |
| Vấn đề vừa | 3 |
| Nhất quán UI | ❌ Hai theme khác nhau |

---

## 1. Cấu trúc dự án thực tế

```
app/
├── page.js                        ← Trang chủ (danh sách tool)
├── layout.js                      ← Root layout + metadata + Footer
├── components/
│   ├── FileDropzone.jsx           ← Component reusable (chỉ dùng ở pdf-sang-md)
│   └── Footer.jsx                 ← Footer hệ sinh thái GIAP KHAMPHA
├── lib/
│   ├── pdf-extract.js             ← Extract text từ PDF (pdfjs-dist)
│   ├── format-markdown.js         ← Text → Markdown
│   ├── pdf-merge.js               ← Ghép PDF (pdf-lib) — mới thêm v0.4.0
│   └── parse-page-ranges.js       ← Parse "1-3,5,7-10" — mới thêm v0.4.0
├── api/
│   └── process/route.js           ← ⚠️ Proxy tới stirling.tools (xem §6.1)
├── tool/
│   └── [id]/page.js               ← ~820 dòng, xử lý 20 tool qua switch
└── tools/
    ├── pdf-sang-md/page.jsx       ← Tool riêng: PDF → Markdown
    └── ghep-pdf/page.jsx          ← Tool riêng: Ghép PDF — mới thêm v0.4.0

public/
└── pdf.worker.min.mjs             ← ✅ Worker pdfjs-dist (bắt buộc)
```

---

## 2. Đánh giá từng tool

### 2.1 Tool riêng (`/tools/...`) — Dark theme

#### ✅ PDF → Markdown (`/tools/pdf-sang-md`)
- Drag & drop, chọn file ✅
- Tùy chọn: số trang, tên file làm tiêu đề ✅
- Phát hiện PDF scan → cảnh báo thân thiện ✅
- Preview Markdown, tải xuống `.md`, copy clipboard ✅
- Error tiếng Việt, không dùng `alert()` ✅
- 100% client-side ✅
- **Kết luận: Hoạt động trơn tru.**

#### ✅ Ghép PDF (`/tools/ghep-pdf`)
- Drag & drop nhiều file ✅
- Kéo thả + nút ↑↓ để sắp xếp ✅
- Input phạm vi trang từng file (`1-3, 5, 7-10`) ✅
- Đếm trang tự động, hiển thị bên cạnh tên file ✅
- Phát hiện PDF có mật khẩu, file hỏng → lỗi tiếng Việt ✅
- Progress callback, download kết quả ✅
- 100% client-side ✅
- **Kết luận: Hoạt động trơn tru.**

---

### 2.2 Tool động (`/tool/[id]`) — Light theme

Tất cả các tool dưới đây đi qua file `app/tool/[id]/page.js`.

| Tool | Đường dẫn | Trạng thái | Ghi chú |
|---|---|---|---|
| Ghép PDF | `/tool/merge` | ✅ Hoạt động | Dùng pdf-lib, ghép đơn giản — **không có chọn trang** như `/tools/ghep-pdf` |
| Tách PDF | `/tool/split` | ✅ Hoạt động | Xuất từng trang thành file riêng |
| Nén PDF | `/tool/compress` | ⚠️ Một phần | Chỉ bật `useObjectStreams:true`, **không nén ảnh** — hiệu quả rất thấp |
| Xoay PDF | `/tool/rotate` | ✅ Hoạt động | Hỗ trợ 90°/180°/270° |
| Watermark | `/tool/watermark` | ✅ Hoạt động | Text watermark chéo 45°, opacity 35% |
| Ảnh sang PDF | `/tool/jpg-to-pdf` | ✅ Hoạt động | JPG + PNG, nhiều file |
| PDF sang Ảnh | `/tool/pdf-to-jpg` | ✅ Hoạt động | Render canvas scale 2x, xuất JPG |
| Word sang PDF | `/tool/word-to-pdf` | ⚠️ Một phần | Dùng mammoth → HTML → mở hộp in, **user phải bấm Ctrl+P** |
| Excel sang PDF | `/tool/excel-to-pdf` | ⚠️ Một phần | XLSX → HTML → mở hộp in, **user phải bấm Ctrl+P** |
| PowerPoint sang PDF | `/tool/ppt-to-pdf` | ⚠️ Một phần | **Không có handler** → hiện thông báo "Đang phát triển" |
| HTML sang PDF | `/tool/html-to-pdf` | ⚠️ Một phần | Mở file HTML → mở hộp in, **user phải bấm Ctrl+P** |
| PDF sang Word | `/tool/pdf-to-word` | ✅ Hoạt động | Trích text có cấu trúc → `.docx` (heading phát hiện theo font size) |
| PDF sang Excel | `/tool/pdf-to-excel` | ✅ Hoạt động | Text từng dòng → bảng Excel (.xlsx) |
| Bảo vệ PDF | `/tool/protect` | ❌ Chưa làm | Có trong toolConfig nhưng không có handler → lỗi "Đang phát triển" |
| Mở khóa PDF | `/tool/unlock` | ❌ Chưa làm | Có trong toolConfig nhưng không có handler → lỗi "Đang phát triển" |
| Xóa trang | `/tool/delete-pages` | ✅ Hoạt động | Input `1,3,5-7` |
| Trích xuất trang | `/tool/extract-pages` | ✅ Hoạt động | Input `1,3,5-7` |
| Đánh số trang | `/tool/page-numbers` | ✅ Hoạt động | Số trang ở giữa footer mỗi trang |
| Ký PDF | `/tool/sign` | ✅ Hoạt động | Canvas vẽ tay, nhúng PNG vào trang cuối |
| Làm phẳng PDF | `/tool/flatten` | ✅ Hoạt động | Copy + save với `useObjectStreams:false` |
| OCR tiếng Việt | `/tool/ocr` | ✅ Hoạt động | tesseract.js `vie+eng`, export `.txt`, progress % |
| Sửa PDF lỗi | `/tool/repair` | 🚫 Không có | Không trong toolConfig → trang 404/trống |

---

## 3. Thư viện — tình trạng sử dụng

| Package | Cài? | Dùng ở đâu | Tình trạng |
|---|---|---|---|
| `pdf-lib` | ✅ | `pdf-merge.js`, `[id]/page.js` (7 tool) | ✅ Dùng đúng |
| `pdfjs-dist` | ✅ | `pdf-extract.js`, `[id]/page.js` | ✅ Dùng đúng |
| `mammoth` | ✅ | `[id]/page.js` (word-to-pdf) | ✅ Dùng đúng |
| `docx` | ✅ | `[id]/page.js` (pdf-to-word) | ✅ Dùng đúng |
| `xlsx` | ✅ | `[id]/page.js` (pdf-to-excel, excel-to-pdf) | ✅ Dùng đúng |
| `tesseract.js` | ✅ | `[id]/page.js` (ocr) | ✅ Dùng đúng |
| **`jspdf`** | ✅ | **Không được import ở đâu** | **⚠️ Cài thừa** |

---

## 4. Component — tính tái sử dụng

| Component | Tạo bởi | Dùng ở | Tình trạng |
|---|---|---|---|
| `FileDropzone.jsx` | `app/components/` | Chỉ `pdf-sang-md/page.jsx` | ⚠️ Tái dùng chưa tối đa |
| `Footer.jsx` | `app/components/` | `app/layout.js` (toàn app) | ✅ Đúng vị trí |
| `DropZone` (nội bộ) | `[id]/page.js` | Chỉ `[id]/page.js` | ⚠️ Trùng lặp với FileDropzone |
| `SignaturePad` (nội bộ) | `[id]/page.js` | Chỉ `[id]/page.js` | Chấp nhận được |

`ghep-pdf/page.jsx` cũng tự implement dropzone riêng thay vì dùng `FileDropzone` — 3 dropzone implementation tồn tại song song.

---

## 5. Nhất quán UI / theme

| Trang | Theme | Màu nền | Màu accent |
|---|---|---|---|
| Trang chủ (`/`) | **Light** | `bg-gray-50` | `border-blue-200` |
| `/tools/pdf-sang-md` | **Dark** | `bg-neutral-950` | `emerald-500` |
| `/tools/ghep-pdf` | **Dark** | `bg-neutral-950` | `emerald-500` |
| `/tool/[id]` | **Light** | `bg-gray-50` | `bg-blue-500` |

**Vấn đề**: Trang chủ và `/tool/[id]` dùng theme sáng (blue accent), trong khi 2 tool chuyên dụng dùng dark theme (emerald accent) theo đúng CONVENTIONS.md. User khi chuyển qua lại giữa các trang sẽ bị thay đổi giao diện đột ngột.

---

## 6. Vấn đề cần xử lý

### 🔴 Nghiêm trọng

**6.1 — API route `/api/process/route.js` vi phạm cam kết privacy**

File này proxy file của user qua server PDF Việt tới `https://stirling.tools`:
```js
const res = await fetch(`https://stirling.tools/api/v1/convert/${stirlingId}`, { method: "POST", body: formData });
```
Hiện tại **không có client code nào gọi route này**, nhưng route vẫn công khai hoạt động trên production. Nếu ai đó (hoặc code cũ) gọi `POST /api/process`, file user sẽ bị upload lên server nước ngoài — **vi phạm trực tiếp cam kết "100% client-side"** trên mọi trang tool.

→ **Hành động cần làm:** Xóa file này.

**6.2 — Worker pdfjs-dist khác nhau giữa hai vị trí**

`app/lib/pdf-extract.js` dùng:
```js
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"; // public/
```

`app/tool/[id]/page.js` dùng:
```js
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
```

Cách thứ 2 dùng `import.meta.url` — trong Next.js App Router production build (Turbopack), URL này có thể resolve sai dẫn đến worker không load được. Cần kiểm tra thực tế trên production build.

→ **Hành động cần làm:** Đổi sang cách nhất quán dùng `/pdf.worker.min.mjs` (từ public/).

---

### 🟡 Vừa

**6.3 — `jspdf` cài thừa**

Package `jspdf` (4.2.1) được cài nhưng không được import ở bất kỳ file nào. Tăng nhẹ thời gian install và có thể gây nhầm lẫn.

→ **Hành động:** Xóa khỏi `package.json` khi có dịp.

**6.4 — `protect` và `unlock` có trong toolConfig nhưng không có handler**

Khi user nhấn "Xử lý ngay", cả hai tool rơi vào `default` trong switch:
```js
default:
  throw new Error("Công cụ này đang được phát triển.");
```
User thấy thông báo lỗi đỏ thay vì giao diện "coming soon" thân thiện. Khác với tool `repair` (không có trong toolConfig) — hiện màn hình xây dựng đẹp hơn.

→ **Hành động:** Hoặc xóa khỏi toolConfig (link → 404), hoặc implement, hoặc handle riêng để hiện thông báo thân thiện.

**6.5 — Compress PDF hoạt động nhưng kém hiệu quả**

`processCompress` chỉ copy pages + `useObjectStreams: true`. Không nén ảnh, không giảm resolution. Với PDF có nhiều ảnh (ảnh scan), kết quả có thể **to hơn** file gốc.

→ **Hành động:** Thêm ghi chú cảnh báo trong UI, hoặc implement nén ảnh thật (cần canvas re-render).

---

## 7. Điểm tốt cần giữ nguyên

- ✅ Lazy import các thư viện nặng (`pdfjs-dist`, `pdf-lib`, `tesseract.js`, `mammoth`, `docx`, `xlsx`) — không break Server Components
- ✅ Error tiếng Việt thân thiện trên mọi tool, không dùng `alert()`
- ✅ Progress indicator rõ ràng trên OCR, pdf-to-jpg, pdf-to-word
- ✅ `pdf.worker.min.mjs` có mặt trong `public/` — build không fail
- ✅ `"use client"` đúng chỗ, không đặt nhầm trong Server Component
- ✅ Footer hệ sinh thái GIAP KHAMPHA đồng nhất toàn app (qua layout.js)
- ✅ Metadata SEO đầy đủ (OG, Twitter Card, lang=vi)
- ✅ Accessibility cơ bản: `aria-label`, `role="alert"`, focus ring trên các tool mới

---

## 8. Thứ tự ưu tiên xử lý

| # | Việc cần làm | Ưu tiên | Khó | Ghi chú |
|---|---|---|---|---|
| 1 | Xóa `app/api/process/route.js` | 🔴 Cao | Dễ | Xóa 1 file |
| 2 | Đồng nhất workerSrc pdfjs-dist | 🔴 Cao | Dễ | Sửa 1 dòng trong `[id]/page.js` |
| 3 | Xóa `jspdf` khỏi dependencies | 🟡 Vừa | Dễ | `npm uninstall jspdf` |
| 4 | Fix `protect`/`unlock` UX | 🟡 Vừa | Dễ | Thêm case vào switch hoặc xóa khỏi toolConfig |
| 5 | Thêm cảnh báo vào Compress PDF | 🟡 Vừa | Dễ | Thêm `<div>` ghi chú |
| 6 | Implement `protect`/`unlock` | 🟡 Vừa | Khó | pdf-lib không hỗ trợ encrypt; cần nghiên cứu |
| 7 | Đồng nhất dark theme cho `[id]` | 🟢 Thấp | Vừa | Refactor UI [id]/page.js |
| 8 | Tách `[id]/page.js` thành sub-components | 🟢 Thấp | Vừa | ~820 dòng, khó maintain |

---

*Báo cáo này được tạo tự động bởi Claude Code — chỉ phản ánh trạng thái code tại thời điểm audit, không phải trạng thái runtime thực tế.*
