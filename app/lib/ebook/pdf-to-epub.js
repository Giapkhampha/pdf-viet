/**
 * PDF → EPUB (reflowable) chạy hoàn toàn trên trình duyệt.
 *
 * Flow:
 *   1. Trích text có cấu trúc từ PDF (fontSize, bold, vị trí Y) — dùng chung
 *      `extractStructuredText` với PDF → Word/Excel.
 *   2. Suy luận heading (font lớn hơn cỡ trung bình) → cắt thành chương, và
 *      ghép các dòng thân bài lại thành đoạn văn dựa trên khoảng cách dòng.
 *   3. Render trang 1 thành ảnh JPEG làm bìa.
 *   4. Đóng gói thành EPUB 3 (ZIP: mimetype + container + OPF + nav + ncx +
 *      css + các chương XHTML) bằng `buildZip` tự viết — không cài package.
 *
 * Hạn chế: PDF là định dạng cố định trang, EPUB là reflowable. Bảng, bố cục
 * nhiều cột, và PDF scan (không có text) sẽ không chuyển tốt — với bản scan
 * hãy chạy OCR trước.
 */

import { extractStructuredText } from "@/app/lib/pdf-structured-extract";
import { getPdfjs } from "@/app/lib/_pdfjs-loader";
import { buildZip } from "@/app/lib/ebook/zip";

/**
 * @param {File} file  file PDF
 * @param {(msg: string) => void} [onProgress]
 * @returns {Promise<Uint8Array>} nội dung file .epub
 */
export async function pdfToEpub(file, onProgress) {
  const pages = await extractStructuredText(file, onProgress);

  const totalLines = pages.reduce((n, p) => n + p.lines.length, 0);
  if (totalLines === 0) {
    throw new Error(
      "PDF này không chứa text (có thể là bản scan/ảnh). Hãy chạy OCR trước rồi thử lại."
    );
  }

  onProgress?.("Đang phân tích cấu trúc chương...");
  const title = file.name.replace(/\.pdf$/i, "").trim() || "Sách";
  const chapters = buildChapters(pages);

  onProgress?.("Đang tạo trang bìa...");
  const cover = await renderCover(file).catch(() => null);

  onProgress?.("Đang đóng gói EPUB...");
  return assembleEpub({ title, chapters, cover });
}

// ─── Cắt chương + ghép đoạn văn ──────────────────────────────────────────────

function buildChapters(pages) {
  const sizes = pages.flatMap((p) => p.lines.map((l) => l.fontSize)).filter(Boolean);
  const avg = sizes.length ? sizes.reduce((a, b) => a + b, 0) / sizes.length : 12;

  // Có heading rõ ràng không? Nếu không, cắt chương theo từng trang.
  const hasHeadings = pages.some((p) =>
    p.lines.some((l) => l.fontSize / avg >= 1.5 || (l.fontSize / avg >= 1.3 && l.isBold))
  );

  const chapters = [];
  let current = null;
  let para = [];

  const flushPara = () => {
    if (!current) return;
    const text = para.join(" ").replace(/\s+/g, " ").trim();
    if (text) current.blocks.push(`<p>${escapeXml(text)}</p>`);
    para = [];
  };

  const startChapter = (chapTitle, showHeading) => {
    flushPara();
    if (current && current.blocks.length) chapters.push(current);
    current = { title: chapTitle, blocks: [] };
    if (showHeading) current.blocks.push(`<h1>${escapeXml(chapTitle)}</h1>`);
  };

  for (let pi = 0; pi < pages.length; pi++) {
    const { lines } = pages[pi];

    if (!hasHeadings) {
      // Không có heading → mỗi trang là một mục để TOC vẫn điều hướng được.
      startChapter(`Trang ${pi + 1}`, false);
    }

    let prevY = null;
    for (const line of lines) {
      const { text, fontSize, isBold, y } = line;
      if (!text) continue;
      const ratio = fontSize / avg;
      const isHeading = ratio >= 1.5 || (ratio >= 1.3 && isBold);
      const isSub = !isHeading && (ratio >= 1.2 || (ratio >= 1.05 && isBold));

      if (hasHeadings && isHeading) {
        startChapter(text, true);
        prevY = null;
        continue;
      }

      if (!current) startChapter("Mở đầu", true);

      // Khoảng trống dọc lớn → kết thúc đoạn hiện tại.
      if (prevY !== null && prevY - y > fontSize * 1.8) flushPara();
      prevY = y;

      if (isSub) {
        flushPara();
        current.blocks.push(`<h2>${escapeXml(text)}</h2>`);
      } else {
        para.push(text);
      }
    }
    flushPara();
    prevY = null;
  }

  flushPara();
  if (current && current.blocks.length) chapters.push(current);

  // An toàn: không có block nào (mọi dòng rỗng) → 1 chương trống.
  if (chapters.length === 0) {
    chapters.push({ title: "Nội dung", blocks: ["<p></p>"] });
  }
  return chapters;
}

// ─── Render trang 1 làm bìa ──────────────────────────────────────────────────

async function renderCover(file) {
  const pdfjs = await getPdfjs();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
  const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.85));
  if (!blob) return null;
  return {
    bytes: new Uint8Array(await blob.arrayBuffer()),
    width: canvas.width,
    height: canvas.height,
  };
}

// ─── Đóng gói EPUB ───────────────────────────────────────────────────────────

function assembleEpub({ title, chapters, cover }) {
  const uid = `urn:uuid:${uuid()}`;
  const modified = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  const safeTitle = escapeXml(title);

  const entries = [];
  // 1. mimetype PHẢI đứng đầu, stored.
  entries.push({ name: "mimetype", data: "application/epub+zip" });

  // 2. container
  entries.push({
    name: "META-INF/container.xml",
    data: `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`,
  });

  // 3. CSS
  entries.push({ name: "OEBPS/style.css", data: BOOK_CSS });

  // 4. Bìa (nếu render được)
  if (cover) {
    entries.push({ name: "OEBPS/cover.jpg", data: cover.bytes });
    entries.push({
      name: "OEBPS/cover.xhtml",
      data: xhtmlDoc(
        "Bìa",
        `<div class="cover"><img src="cover.jpg" alt="Bìa sách"/></div>`
      ),
    });
  }

  // 5. Các chương
  const chapterFiles = chapters.map((c, i) => {
    const name = `chap${i + 1}.xhtml`;
    entries.push({
      name: `OEBPS/${name}`,
      data: xhtmlDoc(c.title, c.blocks.join("\n")),
    });
    return { name, title: c.title, id: `chap${i + 1}` };
  });

  // 6. nav.xhtml (EPUB 3)
  const navItems = chapterFiles
    .map((c) => `      <li><a href="${c.name}">${escapeXml(c.title)}</a></li>`)
    .join("\n");
  entries.push({
    name: "OEBPS/nav.xhtml",
    data: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="vi">
<head><meta charset="utf-8"/><title>Mục lục</title></head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Mục lục</h1>
    <ol>
${navItems}
    </ol>
  </nav>
</body>
</html>`,
  });

  // 7. toc.ncx (tương thích đọc EPUB 2)
  const navPoints = chapterFiles
    .map(
      (c, i) => `    <navPoint id="${c.id}" playOrder="${i + 1}">
      <navLabel><text>${escapeXml(c.title)}</text></navLabel>
      <content src="${c.name}"/>
    </navPoint>`
    )
    .join("\n");
  entries.push({
    name: "OEBPS/toc.ncx",
    data: `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head><meta name="dtb:uid" content="${uid}"/></head>
  <docTitle><text>${safeTitle}</text></docTitle>
  <navMap>
${navPoints}
  </navMap>
</ncx>`,
  });

  // 8. content.opf
  const manifestItems = [
    `    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`,
    `    <item id="css" href="style.css" media-type="text/css"/>`,
  ];
  const spineItems = [];
  if (cover) {
    manifestItems.push(
      `    <item id="cover-image" href="cover.jpg" media-type="image/jpeg" properties="cover-image"/>`,
      `    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>`
    );
    spineItems.push(`    <itemref idref="cover"/>`);
  }
  for (const c of chapterFiles) {
    manifestItems.push(
      `    <item id="${c.id}" href="${c.name}" media-type="application/xhtml+xml"/>`
    );
    spineItems.push(`    <itemref idref="${c.id}"/>`);
  }

  entries.push({
    name: "OEBPS/content.opf",
    data: `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">${uid}</dc:identifier>
    <dc:title>${safeTitle}</dc:title>
    <dc:language>vi</dc:language>
    <dc:creator>PDF Việt — giapkhampha.me</dc:creator>
    <meta property="dcterms:modified">${modified}</meta>
${cover ? '    <meta name="cover" content="cover-image"/>\n' : ""}  </metadata>
  <manifest>
${manifestItems.join("\n")}
  </manifest>
  <spine toc="ncx">
${spineItems.join("\n")}
  </spine>
</package>`,
  });

  return buildZip(entries);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BOOK_CSS = `body {
  font-family: serif;
  line-height: 1.6;
  margin: 1em;
  text-align: justify;
}
h1 { font-size: 1.6em; line-height: 1.3; margin: 1em 0 0.6em; text-align: left; }
h2 { font-size: 1.25em; line-height: 1.3; margin: 1.2em 0 0.4em; text-align: left; }
p { margin: 0 0 0.7em; text-indent: 1.2em; }
h1 + p, h2 + p { text-indent: 0; }
img { max-width: 100%; height: auto; }
.cover { text-align: center; margin: 0; padding: 0; }
.cover img { max-width: 100%; height: auto; }
`;

function xhtmlDoc(docTitle, bodyHtml) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="vi">
<head>
  <meta charset="utf-8"/>
  <title>${escapeXml(docTitle)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function escapeXml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  })[c]);
}

function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
