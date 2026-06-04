/**
 * Markdown → PDF qua print dialog của trình duyệt.
 *
 * Flow: MD → HTML (marked) → mở cửa sổ in với CSS đẹp → user chọn
 * "Save as PDF" để xuất file. Giữ font tiếng Việt + print engine của
 * browser handle pagination tốt hơn jsPDF cho document dài.
 */
export async function markdownToPdfViaPrint(markdown, title = "Markdown") {
  const { marked } = await import("marked");

  // Cấu hình marked — disable HTML raw để tránh XSS từ MD lạ
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  const html = marked.parse(markdown);

  const win = window.open("", "_blank", "width=800,height=600");
  if (!win) {
    throw new Error("Trình duyệt chặn cửa sổ in. Vui lòng cho phép popup rồi thử lại.");
  }

  win.document.write(`<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  @page { margin: 20mm; size: A4; }
  body {
    font-family: 'Times New Roman', 'Segoe UI', serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #1a1a1a;
    max-width: 100%;
  }
  h1, h2, h3, h4, h5, h6 { margin-top: 1.2em; line-height: 1.3; }
  h1 { font-size: 22pt; border-bottom: 2px solid #ddd; padding-bottom: 6px; }
  h2 { font-size: 18pt; }
  h3 { font-size: 15pt; }
  h4 { font-size: 13pt; }
  p { margin: 0.6em 0; }
  ul, ol { margin: 0.6em 0; padding-left: 1.8em; }
  li { margin: 0.2em 0; }
  blockquote {
    margin: 1em 0;
    padding: 0.4em 1em;
    border-left: 4px solid #888;
    background: #f7f7f7;
    color: #444;
  }
  code {
    font-family: 'Cascadia Mono', 'Consolas', monospace;
    background: #f0f0f0;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 0.92em;
  }
  pre {
    background: #f7f7f7;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    padding: 10px 14px;
    overflow-x: auto;
    page-break-inside: avoid;
  }
  pre code { background: transparent; padding: 0; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
  th { background: #f0f0f0; }
  hr { border: none; border-top: 1px solid #ccc; margin: 2em 0; }
  a { color: #0066cc; text-decoration: underline; }
  img { max-width: 100%; height: auto; }
</style>
</head>
<body>
${html}
</body>
</html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 800);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}
