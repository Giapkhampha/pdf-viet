# CLAUDE.md — PDF Việt

> File này được Claude Code **tự động đọc** khi bắt đầu mỗi phiên làm việc.
> Mục tiêu: cho Claude (ở bất kỳ phiên/tài khoản nào) hiểu nhanh dự án trong < 30 giây.

## Dự án 1 dòng
**PDF Việt** — Bộ công cụ xử lý PDF/Word/Excel/OCR chạy hoàn toàn trên trình duyệt, ưu tiên tiếng Việt. Là một sản phẩm trong hệ sinh thái **GIAP KHAMPHA** của **Ba Maya**.

## Tech stack
- **Framework:** Next.js 16.2 (App Router) + React 19.2
- **Styling:** Tailwind CSS v4
- **Language:** JavaScript thuần (KHÔNG phải TypeScript) — alias `@/*` trỏ về root
- **Package manager:** npm

## Thư viện xử lý chính
| Thư viện | Dùng cho |
|---|---|
| `pdf-lib` | Ghép/tách/xoay/watermark PDF |
| `pdfjs-dist` | Render & đọc PDF (cần worker config) |
| `jspdf` | Tạo PDF mới |
| `mammoth` | DOCX → HTML |
| `docx` | Tạo file DOCX |
| `xlsx` | Đọc/ghi Excel |
| `tesseract.js` | OCR (hỗ trợ tiếng Việt — `lang: "vie"`) |

## Lệnh thường dùng
```bash
npm run dev      # localhost:3000
npm run build
npm run lint
```

## Quy tắc tuyệt đối
1. **Không cài thêm package** trừ khi được yêu cầu rõ — repo này nhẹ là một feature.
2. **Không thêm TypeScript.** Project có chủ đích dùng JS.
3. **Mọi xử lý file phải chạy ở client.** Không upload file user lên server. Đây là cam kết quyền riêng tư cốt lõi của sản phẩm.
4. **Footer mỗi trang phải kết nối về hệ sinh thái** giapkhampha.me (xem `docs/CONTEXT.md`).

## Quirks cần nhớ (Next.js + thư viện PDF)
- `pdfjs-dist` cần worker → khai báo trong file dùng nó:
  ```js
  import * as pdfjs from "pdfjs-dist";
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  ```
  Worker file phải copy vào `public/` (manual hoặc qua postinstall script).
- `tesseract.js` nặng (~10MB language data) → lazy load, không import top-level trong Server Component.
- `mammoth` & `xlsx` chỉ chạy được client → component dùng chúng cần `"use client"`.

## Ngôn ngữ làm việc
Ba Maya thường trao đổi bằng **tiếng Việt**. UI cũng tiếng Việt là chính. Khi viết code/comment có thể dùng tiếng Anh, nhưng text hiển thị cho user → tiếng Việt thuần, dấu đầy đủ.

## Đọc thêm khi cần
Đừng đọc tất cả ngay đầu phiên — chỉ đọc khi gặp tình huống cần:

- 📖 **`docs/CONTEXT.md`** — Đọc khi: cần làm UI/branding, footer, copy text marketing, hay bất kỳ thứ gì liên quan đến Ba Maya hoặc hệ sinh thái GIAP KHAMPHA.
- 📊 **`docs/STATUS.md`** — Đọc đầu mỗi phiên dài để biết đang ở đâu. Cập nhật cuối phiên khi xong việc.
- 🗺️ **`docs/ROADMAP.md`** — Đọc khi Ba Maya hỏi "tiếp theo làm gì?" hoặc khi đề xuất tính năng mới.
- 🎨 **`docs/CONVENTIONS.md`** — Đọc khi: viết component mới, đặt tên file/folder, hoặc không chắc về code style.

## Khi không chắc
1. Hỏi Ba Maya, đừng đoán.
2. **Đặc biệt: đừng tự ý cài package mới**, đừng tự ý thêm TypeScript, đừng tự ý gửi file lên server.
