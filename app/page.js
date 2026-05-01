import Link from "next/link";

const tools = [
  // Chuyển đổi sang PDF
  { id: "word-to-pdf", title: "Word sang PDF", desc: "Chuyển file .docx, .doc thành PDF", icon: "📄", color: "blue" },
  { id: "excel-to-pdf", title: "Excel sang PDF", desc: "Chuyển bảng tính Excel thành PDF", icon: "📊", color: "green" },
  { id: "ppt-to-pdf", title: "PowerPoint sang PDF", desc: "Chuyển bài thuyết trình thành PDF", icon: "📑", color: "orange" },
  { id: "jpg-to-pdf", title: "Ảnh sang PDF", desc: "Ghép JPG, PNG thành file PDF", icon: "🖼️", color: "pink" },
  { id: "html-to-pdf", title: "HTML sang PDF", desc: "Chuyển trang web thành PDF", icon: "🌐", color: "purple" },
  // Chuyển từ PDF ra
  { id: "pdf-to-markdown", href: "/tools/pdf-sang-md", title: "PDF sang Markdown", desc: "Chuyển PDF sang .md dùng với ChatGPT, Claude, Gemini", icon: "📝", color: "emerald" },
  { id: "pdf-to-word", title: "PDF sang Word", desc: "Chuyển PDF thành file Word có thể sửa", icon: "📝", color: "blue" },
  { id: "pdf-to-jpg", title: "PDF sang Ảnh", desc: "Xuất từng trang PDF thành ảnh", icon: "🖼️", color: "yellow" },
  { id: "pdf-to-excel", title: "PDF sang Excel", desc: "Trích xuất bảng từ PDF sang Excel", icon: "📊", color: "green" },
  // Chỉnh sửa PDF
  { id: "merge", title: "Ghép PDF", desc: "Kết hợp nhiều PDF thành một", icon: "🔗", color: "teal" },
  { id: "split", title: "Tách PDF", desc: "Chia PDF thành nhiều file nhỏ", icon: "✂️", color: "red" },
  { id: "compress", title: "Nén PDF", desc: "Giảm dung lượng file PDF", icon: "🗜️", color: "indigo" },
  { id: "rotate", title: "Xoay PDF", desc: "Xoay trang PDF theo góc tùy chọn", icon: "🔄", color: "cyan" },
  { id: "watermark", title: "Thêm watermark", desc: "Thêm chữ đóng dấu vào PDF", icon: "💧", color: "gray" },
  { id: "page-numbers", title: "Đánh số trang", desc: "Tự động đánh số trang cho PDF", icon: "🔢", color: "violet" },
  { id: "delete-pages", title: "Xóa trang", desc: "Xóa các trang không cần trong PDF", icon: "🗑️", color: "red" },
  { id: "extract-pages", title: "Trích xuất trang", desc: "Lấy một số trang từ PDF", icon: "📤", color: "orange" },
  // Bảo mật
  { id: "protect", title: "Bảo vệ PDF", desc: "Đặt mật khẩu cho file PDF", icon: "🔒", color: "red" },
  { id: "unlock", title: "Mở khóa PDF", desc: "Xóa mật khẩu khỏi PDF", icon: "🔓", color: "green" },
  { id: "flatten", title: "Làm phẳng PDF", desc: "Chuyển PDF về dạng không chỉnh sửa được", icon: "📋", color: "gray" },
  // Khác
  { id: "ocr", title: "OCR - Nhận dạng chữ", desc: "Nhận dạng chữ trong ảnh/PDF scan", icon: "🔍", color: "blue" },
  { id: "sign", title: "Ký PDF", desc: "Thêm chữ ký vào tài liệu PDF", icon: "✍️", color: "purple" },
  { id: "repair", title: "Sửa PDF lỗi", desc: "Khôi phục file PDF bị hỏng", icon: "🔧", color: "yellow" },
];

const colorMap = {
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  green: "bg-green-50 text-green-600 border-green-100",
  orange: "bg-orange-50 text-orange-600 border-orange-100",
  pink: "bg-pink-50 text-pink-600 border-pink-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
  yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
  teal: "bg-teal-50 text-teal-600 border-teal-100",
  red: "bg-red-50 text-red-600 border-red-100",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
  gray: "bg-gray-50 text-gray-600 border-gray-100",
  violet: "bg-violet-50 text-violet-600 border-violet-100",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📄</span>
            <span className="text-xl font-bold text-gray-800">PDF Việt</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Miễn phí 100%</span>
          </div>
          <p className="text-sm text-gray-500 hidden sm:block">Công cụ PDF tiếng Việt — Nhanh, an toàn, không cần đăng ký</p>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Công cụ PDF miễn phí
          </h1>
          <p className="text-lg text-gray-500">
            Chuyển đổi, chỉnh sửa, bảo vệ file PDF — Tất cả miễn phí, không giới hạn
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href ?? `/tool/${tool.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl mb-3 ${colorMap[tool.color] || colorMap.blue}`}>
                {tool.icon}
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                {tool.title}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {tool.desc}
              </p>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-400 border-t border-gray-100 mt-10">
  <p>PDF Việt — Miễn phí, không quảng cáo, không lưu file của bạn</p>
  <p className="mt-2 text-xs text-gray-400">
    App by Quý Giáp — Follow Facebook để cập nhật thêm nhiều app mới về giáo dục:{" "}
    <a
      href="https://www.facebook.com/langnghelamchame/"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 font-medium ml-1"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
      Facebook
    </a>
  </p>
</footer>
    </div>
  );
}