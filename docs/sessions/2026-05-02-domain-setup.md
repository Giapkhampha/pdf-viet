# Phiên 02/05/2026 — Setup domain + cleanup critical

## 🎯 Mục tiêu phiên
- Hoàn thiện tool Ghép PDF (v0.4.0)
- Fix 2 vấn đề critical từ AUDIT (v0.4.1)
- Setup domain chính thức pdf.giapkhampha.me (v0.4.2)
- Chuẩn bị bộ tài liệu marketing

## ✅ Kết quả

### Code & Infrastructure
| Phiên bản | Commit | Nội dung |
|---|---|---|
| v0.4.0 | 1d5ad54 | Tool Ghép PDF — drag-drop sắp xếp + tùy chọn trang |
| v0.4.1 | 196670c | Fix critical: gỡ proxy stirling.tools, đồng nhất workerSrc pdfjs |
| v0.4.2 | 5a111e3 | Setup domain pdf.giapkhampha.me |

### Domain & DNS
- **Domain mua tại Tenten.vn** — 1 năm — 02/05/2026 đến 02/05/2027
  - Phí năm 1: 193.320đ (có VAT, không kèm DNSSEC)
  - Lưu ý: phí gia hạn năm 2 có thể tăng — cân nhắc transfer sang registrar khác (xem domain-strategy.md)
- **DNS quản lý qua Cloudflare gói Free**
  - Nameserver: `delilah.ns.cloudflare.com`, `tate.ns.cloudflare.com`
  - 3 DNS records (A @, CNAME www, CNAME pdf) — tất cả DNS only (không bật Proxy)
  - Email Routing: `lienhe@giapkhampha.me` → Gmail (forward miễn phí)
- **Vercel hosting**
  - giapkhampha.me → project giapkhamphame (trang chủ ecosystem)
  - pdf.giapkhampha.me → project pdf-viet (PDF Việt)
  - SSL: Let's Encrypt qua Vercel (auto-renew)
  - Redirect 308: pdf-viet.vercel.app → pdf.giapkhampha.me

### Tài liệu marketing đã chuẩn bị (lưu ngoài repo, ở Drive/Notion của Ba Maya)
- `marketing-blog-post.md` — bài blog dài cho giapkhampha.me
- `marketing-social.md` — 3 phiên bản short cho FB/Zalo/groups
- `marketing-launch-plan.md` — kế hoạch launch 5 giai đoạn
- `domain-strategy.md` — phân tích lựa chọn domain dài hạn

## 🎯 Việc tiếp theo (cho phiên sau)

### Sắp xếp ưu tiên:
1. **Đăng marketing chính thức** — bài blog lên giapkhampha.me, social cuốn chiếu sau
2. **Cleanup Đợt 2 (từ AUDIT)** — gỡ jspdf thừa, UX placeholder cho protect/unlock, cảnh báo Compress PDF
3. **Code tiếp PDF → Word** — Phase 1 ROADMAP còn dở
4. **Header chung + nâng cấp trang chủ** — Phase 1 ROADMAP

### Backlog dài hạn (Phase 2 ROADMAP):
- Đồng nhất theme dark cho toàn app (hiện trang chủ + /tool/[id] đang light theme)
- Tách app/tool/[id]/page.js (~820 dòng) thành sub-components
- OCR PDF tiếng Việt nâng cao
- Word/Excel → PDF không cần Ctrl+P

## 📝 Bài học rút ra
- DNS propagate ở VN có thể mất 30-60 phút (TTL Tenten ban đầu cao)
- Cloudflare Email Routing miễn phí cực kỳ tiện — nên setup ngay khi có domain
- Bỏ tick DNSSEC khi mua ở Tenten nếu định dùng Cloudflare DNS — Cloudflare đã có DNSSEC miễn phí
- Verify privacy commitment bằng F12 → Network là cách hay (sẽ dùng trong bài marketing)

## 🔗 Hạ tầng tham chiếu
- Production: https://pdf.giapkhampha.me
- Trang chủ ecosystem: https://giapkhampha.me
- GitHub: https://github.com/Giapkhampha/pdf-viet
- Vercel project: pdf-viet
- Domain registrar: Tenten.vn (account giap1993)
- DNS: Cloudflare (account Giapkhampha@gmail.com)
- Email forward: lienhe@giapkhampha.me → Gmail
