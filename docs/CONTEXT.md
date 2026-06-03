# CONTEXT.md — Bối cảnh & Hệ sinh thái

## Người làm dự án
- **Ba Maya** — gọi đúng "Ba Maya" trong UI/text, không dùng username/tên thật.
- Đang xây dựng hệ sinh thái **GIAP KHAMPHA** — tập trung vào **ứng dụng AI vào giáo dục cho ba mẹ và trẻ em Việt Nam**.

## Hệ sinh thái GIAP KHAMPHA
- **Trang chủ chính thức:** https://giapkhampha.me
- **Mirror:** https://giapkhamphame.vercel.app
- **Tagline:** *"Nuôi dưỡng thế hệ số — Khám phá, học hỏi và phát triển cùng con 🌱"*

### Các sản phẩm trong hệ sinh thái
1. **giapkhampha.me** — Trang chủ tổng hợp: bài viết, tài nguyên, sách hay, sản phẩm AI giáo dục, gợi ý ý tưởng sáng tạo cho con.
2. **PDF Việt** — https://pdf.giapkhampha.me ← *Dự án này* (đổi từ pdf-viet.vercel.app)
3. **Bé Ngoan Kawaii** — App theo dõi hành vi & tiến bộ của trẻ.
4. (Các sản phẩm khác sẽ được thêm dần)

### PDF Việt vai trò gì?
- Là **công cụ tiện ích** ba mẹ và giáo viên Việt Nam dùng hằng ngày (xử lý bài tập, scan sách, chuyển đổi tài liệu).
- Là **cửa ngõ** đưa user vào hệ sinh thái GIAP KHAMPHA (qua Footer + CTA).
- Là **demo cam kết quyền riêng tư**: file không bao giờ rời máy user.

## Target users
| Nhóm | Nhu cầu chính |
|---|---|
| **Ba mẹ Việt Nam** | Xử lý tài liệu học tập của con, chuyển PDF → Word để chỉnh sửa, OCR sách scan |
| **Giáo viên** | Chuyển đổi tài liệu nhanh, không muốn upload tài liệu nhạy cảm lên dịch vụ nước ngoài |
| **Sinh viên** | OCR tài liệu tiếng Việt, ghép/tách bài tập, nén PDF nộp bài |

## Brand identity

### Logo text "GIAP KHAMPHA"
- `GIAP` — màu **teal/emerald** (`text-emerald-400`, hex `#34d399`)
- `KHAMPHA` — màu **cam-vàng** (`text-amber-400`, hex `#fbbf24`)
- Font: weight đậm (700-800), tracking hơi rộng, có thể uppercase
- Dùng nhất quán ở Header, Footer, OG image của mọi sản phẩm

### Palette tổng (dark theme là default)
| Vai trò | Tailwind class | Hex |
|---|---|---|
| Background nền | `bg-neutral-950` | `#0a0a0a` |
| Background card | `bg-neutral-900` | `#171717` |
| Background card hover | `bg-neutral-800` | `#262626` |
| Border | `border-neutral-800` | `#262626` |
| Accent chính (CTA, link) | `bg-emerald-500` / `text-emerald-400` | `#10b981` / `#34d399` |
| Accent phụ (highlight) | `text-amber-400` | `#fbbf24` |
| Text chính | `text-neutral-100` | `#f5f5f5` |
| Text phụ | `text-neutral-400` | `#a3a3a3` |
| Text mờ (caption, copyright) | `text-neutral-500` | `#737373` |

### Tone of voice
- **Thân thiện, gần gũi** như nói chuyện với ba mẹ khác.
- Dùng "**bạn**" với user, không "anh/chị" trang trọng.
- Emoji nhẹ nhàng có chủ đích: 🌱 ❤️ ✨ → (không lạm dụng).
- Tiếng Việt **chuẩn, dấu đầy đủ**, không teen code, không viết tắt SMS.
- Câu ngắn, dễ hiểu cho ba mẹ không rành công nghệ.

## Quy tắc kết nối hệ sinh thái (BẮT BUỘC)
Mọi sản phẩm trong hệ sinh thái phải có:

1. **Footer kết nối:**
   - Logo GIAP KHAMPHA
   - Tagline ngắn
   - CTA: "Khám phá hệ sinh thái →" → https://giapkhampha.me (mở tab mới: `target="_blank" rel="noopener noreferrer"`)
   - Cột link tới: Trang Chủ, Sản Phẩm AI, Bài Viết, Sách Hay, Tài Nguyên (đều dẫn về `giapkhampha.me/#section`)

2. **Branding badge** ở Header hoặc gần Footer:
   *"Một phần của hệ sinh thái GIAP KHAMPHA 🌱"*

3. **Copyright dòng cuối:**
   `© 2026 GIAP KHAMPHA · Made with ❤️ by Ba Maya`

4. **Cam kết privacy** ở Footer (riêng cho PDF Việt):
   *"Xử lý hoàn toàn trên trình duyệt — file của bạn không upload lên server"*

## Tài liệu tham khảo bên ngoài
- Trang chủ hệ sinh thái: https://giapkhampha.me — xem trực tiếp để bám sát layout, màu, font.
- PDF Việt production: https://pdf.giapkhampha.me
- Khi có bất kỳ thay đổi branding ở giapkhampha.me → cần đồng bộ về `docs/CONTEXT.md` này.
