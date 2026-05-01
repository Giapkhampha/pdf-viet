import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PDF Việt — Công cụ xử lý PDF tiếng Việt, miễn phí 100%",
  description: "Bộ công cụ PDF chạy ngay trên trình duyệt — chuyển PDF sang Markdown, Word, ghép tách PDF... File của bạn không upload lên server. Một sản phẩm trong hệ sinh thái GIAP KHAMPHA.",
  keywords: ["PDF tiếng Việt", "chuyển PDF sang Markdown", "công cụ PDF miễn phí", "PDF to MD", "GIAP KHAMPHA"],
  authors: [{ name: "Ba Maya", url: "https://giapkhampha.me" }],
  openGraph: {
    title: "PDF Việt — Công cụ xử lý PDF tiếng Việt",
    description: "Chuyển PDF sang Markdown để dùng với ChatGPT/Claude/Gemini. Miễn phí 100%, không upload server.",
    url: "https://pdf-viet.vercel.app",
    siteName: "PDF Việt",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Việt — Xử lý PDF ngay trên trình duyệt",
    description: "Miễn phí, không upload server, hỗ trợ tiếng Việt.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        {children}
        <Footer />
      </body>
    </html>
  );
}
