# CONVENTIONS.md — Quy ước code & design

> Đọc file này khi: viết component mới, đặt tên file/folder, không chắc về code style, hoặc khi reviewer/Claude khác cần hiểu cách dự án vận hành.

---

## 🗂️ Cấu trúc thư mục mục tiêu

```
pdf-viet/
├── app/
│   ├── layout.js              # Root layout (chứa <Header /> và <Footer />)
│   ├── page.js                # Trang chủ
│   ├── components/            # Component dùng nhiều nơi
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── EcosystemBadge.jsx
│   │   ├── FileDropzone.jsx
│   │   └── ToolLayout.jsx
│   ├── tools/                 # Mỗi tool 1 route
│   │   ├── ghep-pdf/page.jsx
│   │   ├── tach-pdf/page.jsx
│   │   ├── pdf-sang-word/page.jsx
│   │   └── ocr-tieng-viet/page.jsx
│   └── lib/                   # Logic xử lý file (KHÔNG phải component)
│       ├── pdf-merge.js
│       ├── pdf-split.js
│       ├── pdf-to-docx.js
│       └── ocr.js
├── public/
│   ├── pdf.worker.min.mjs     # Worker của pdfjs-dist
│   ├── favicon.ico
│   └── og-image.png
└── docs/                      # Tài liệu dự án
    ├── CONTEXT.md
    ├── STATUS.md
    ├── ROADMAP.md
    └── CONVENTIONS.md         # File này
```

**URL routing tiếng Việt không dấu, gạch ngang:**
`/tools/ghep-pdf`, `/tools/pdf-sang-word`, `/tools/ocr-tieng-viet`.

---

## 📝 Code conventions

### JavaScript
- **JS thuần.** Không thêm `.ts/.tsx`. Nếu thấy có `.ts`, đó là lỗi cần fix.
- **JSX file extension:** `.jsx` cho component có JSX, `.js` cho logic thuần / utility.
- **Server Component mặc định.** Chỉ thêm `"use client"` khi cần:
  - React hooks (`useState`, `useEffect`, ...)
  - Browser API (`window`, `document`, `File`, `Blob`)
  - Thư viện chỉ chạy client (`mammoth`, `pdfjs-dist`, `tesseract.js`)
- **Không destructure quá sâu** trong props — đọc khó. Tối đa 1 cấp.

### Naming
| Loại | Quy ước | Ví dụ |
|---|---|---|
| Component | `PascalCase` | `FileDropzone.jsx` |
| Hook | `useCamelCase` | `useFileQueue.js` |
| Util/lib | `kebab-case` | `pdf-merge.js` |
| URL slug | tiếng Việt không dấu, kebab-case | `/tools/ghep-pdf` |
| Tên biến | `camelCase` | `mergedPdf`, `fileList` |
| Hằng số | `SCREAMING_SNAKE_CASE` | `MAX_FILE_SIZE_MB` |

### Import
- **Ưu tiên alias `@/`** thay vì relative path dài:
  ```js
  // ✅
  import Footer from "@/app/components/Footer";
  // ❌
  import Footer from "../../../components/Footer";
  ```
- **Thứ tự import:** thư viện ngoài → alias `@/` → relative → CSS.

---

## 🎨 Tailwind v4 conventions

- **Dùng utility class trực tiếp** trong JSX. Không tạo `@apply` trừ khi tái sử dụng > 3 nơi.
- **Dark theme là default.** Toàn app là dark — không cần `dark:` prefix.
- **Spacing scale ưu tiên:** `4 / 6 / 8 / 12 / 16 / 24` (gap, padding, margin).
- **Container chuẩn:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- **Responsive:** mobile-first. Breakpoints dùng nhiều nhất: `sm:`, `md:`, `lg:`. Hiếm khi cần `xl:` `2xl:`.

### Design tokens (rút gọn — chi tiết ở `docs/CONTEXT.md`)
| Vai trò | Class |
|---|---|
| Background nền | `bg-neutral-950` |
| Background card | `bg-neutral-900` |
| Border | `border-neutral-800` |
| Accent chính (CTA) | `bg-emerald-500 hover:bg-emerald-400 text-neutral-950` |
| Accent text (link) | `text-emerald-400 hover:text-emerald-300` |
| Accent phụ | `text-amber-400` |
| Text chính | `text-neutral-100` |
| Text phụ | `text-neutral-400` |
| Text mờ | `text-neutral-500` |

---

## 🧩 Component patterns

### File dropzone (sẽ dùng nhiều nơi)
- Hỗ trợ **drag-and-drop** + **click chọn file**.
- Hiển thị tên file + size sau khi chọn.
- Cho phép **xoá** / **sắp xếp lại thứ tự** (drag handle).
- Validate **MIME type** trước khi xử lý — báo lỗi tiếng Việt rõ ràng.
- Validate **size** — cảnh báo nếu file > 50MB (xử lý sẽ chậm).

### Tool page layout
```jsx
<ToolLayout
  title="Ghép PDF"
  description="Ghép nhiều file PDF thành 1 file duy nhất, ngay trên trình duyệt."
  icon="🧩"
>
  <FileDropzone accept="application/pdf" multiple />
  <Options />
  <ActionButton />
  <ResultArea />
</ToolLayout>
```

### Loading & progress
- **Tool nhanh** (< 1s): chỉ disable button + spinner nhỏ.
- **Tool chậm** (OCR, file lớn): progress bar có % rõ ràng + nút **Huỷ**.
- **Đừng để user nghĩ web bị treo** — luôn có signal đang xử lý.

### Error handling
- **Không dùng `alert()`.** Dùng toast / inline error.
- **Text lỗi tiếng Việt thân thiện**, không hiện stack trace cho user:
  - ✅ "File này có vẻ bị hỏng, bạn thử file khác nhé."
  - ❌ "Error: Invalid PDF structure at offset 0x4F2A"
- Log chi tiết vào `console.error` cho debug, nhưng UI thì friendly.

---

## ♿ Accessibility

- Mọi button & link đều có **text rõ ràng** (không icon-only thiếu `aria-label`).
- Contrast tối thiểu chuẩn **WCAG AA** (4.5:1 cho text thường).
- **Focus ring rõ ràng:** `focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950`.
- Mọi input có `<label>` hoặc `aria-label`.
- Mọi interaction phải hoạt động được bằng **bàn phím** (Tab, Enter, Space, Esc).

---

## ⚡ Performance

- **Lazy load** thư viện nặng bằng `dynamic()`:
  ```js
  import dynamic from "next/dynamic";
  const PDFViewer = dynamic(() => import("./PDFViewer"), { ssr: false });
  ```
- **Web Worker** cho task nặng nếu có thể (`tesseract.js` đã tự dùng worker).
- **Streaming UI** cho task dài: hiển thị từng phần kết quả thay vì chờ hết.
- **Không import top-level** thư viện chỉ chạy client trong Server Component → sẽ build fail.

---

## 🌿 Git commit (đề xuất)

Tiếng Việt OK, ngắn gọn, có **scope**:
```
feat(footer): thêm Footer kết nối hệ sinh thái GIAP KHAMPHA
fix(pdfjs): sửa lỗi worker không load trên production
docs: cập nhật STATUS sau khi xong tool Ghép PDF
chore: cập nhật dependencies
```

Prefix: `feat`, `fix`, `docs`, `style`, `refactor`, `chore`, `test`.

---

## ❓ Khi không chắc

1. Check file này + `docs/CONTEXT.md` trước.
2. Nếu vẫn không rõ → **hỏi Ba Maya, đừng đoán**.
3. Đặc biệt:
   - Đừng tự ý cài package mới
   - Đừng tự ý thêm TypeScript
   - Đừng tự ý gửi file user lên server (vi phạm nguyên tắc privacy)
   - Đừng đổi branding/màu mà chưa cập nhật `docs/CONTEXT.md`
