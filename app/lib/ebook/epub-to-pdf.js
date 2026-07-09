/**
 * EPUB → PDF qua print dialog của trình duyệt.
 *
 * Flow: EPUB (ZIP) → đọc manifest/spine (OPF) → ghép các chương XHTML theo
 * đúng thứ tự đọc → nhúng ảnh dạng data URI → mở cửa sổ in với CSS sách đẹp
 * → user chọn "Save as PDF" để lưu.
 *
 * Vì sao print dialog: chuyển HTML reflowable → PDF (giữ font tiếng Việt,
 * ngắt trang thông minh) cần engine PDF nặng. Print engine của browser làm
 * việc này miễn phí và tốt — cùng cách Word/HTML/Markdown → PDF đang dùng.
 *
 * CSS gốc của EPUB được bỏ qua có chủ đích: nó thường set font/margin cố định
 * gây vỡ layout khi in. Ta áp CSS sách sạch, dễ đọc, tối ưu A4.
 */

import { readZip } from "@/app/lib/ebook/unzip";

const MIME_BY_EXT = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  gif: "image/gif", svg: "image/svg+xml", webp: "image/webp",
};

/** Chuyển .epub thành PDF: parse → ghép HTML → mở cửa sổ in. */
export async function epubToPdfViaPrint(file, onProgress) {
  onProgress?.("Đang mở file EPUB...");
  const zip = await readZip(await file.arrayBuffer());

  onProgress?.("Đang đọc cấu trúc sách...");
  const opfPath = await findOpfPath(zip);
  const book = await parseOpf(zip, opfPath);

  const total = book.spine.length;
  if (total === 0) {
    throw new Error("Không tìm thấy nội dung chương trong EPUB này.");
  }

  const parser = new DOMParser();
  const chaptersHtml = [];
  for (let i = 0; i < total; i++) {
    onProgress?.(`Đang xử lý chương ${i + 1}/${total}...`);
    const item = book.spine[i];
    const raw = await zip.text(item.href);
    if (raw == null) continue;
    const body = await extractChapter(raw, item.href, zip, book.manifest, parser);
    if (body.trim()) chaptersHtml.push(body);
    // Nhường luồng để UI cập nhật progress giữa các chương nặng.
    if (i % 5 === 4) await new Promise((r) => setTimeout(r, 0));
  }

  onProgress?.("Đang chuẩn bị cửa sổ in...");
  const coverImg = await buildCover(zip, book, parser);
  const docTitle = book.title || file.name.replace(/\.epub$/i, "");
  const html = assembleDocument(docTitle, book.author, coverImg, chaptersHtml);

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    throw new Error("Trình duyệt chặn cửa sổ in. Vui lòng cho phép popup rồi thử lại.");
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  // Ảnh cần thời gian decode trước khi in → chờ lâu hơn tool text.
  setTimeout(() => win.print(), 1200);

  return { title: docTitle, chapters: chaptersHtml.length };
}

// ─── Parse OPF (manifest + spine) ────────────────────────────────────────────

async function findOpfPath(zip) {
  const containerXml = await zip.text("META-INF/container.xml");
  if (!containerXml) {
    throw new Error("EPUB thiếu META-INF/container.xml — file có thể bị hỏng.");
  }
  const doc = new DOMParser().parseFromString(containerXml, "application/xml");
  const rootfile = doc.getElementsByTagName("rootfile")[0];
  const path = rootfile?.getAttribute("full-path");
  if (!path) {
    throw new Error("EPUB không khai báo file OPF — file có thể bị hỏng.");
  }
  return path;
}

async function parseOpf(zip, opfPath) {
  const opfText = await zip.text(opfPath);
  if (!opfText) throw new Error("Không đọc được file OPF trong EPUB.");
  const doc = new DOMParser().parseFromString(opfText, "application/xml");
  const baseDir = dirname(opfPath);

  // manifest: id → { href (đã resolve tuyệt đối trong zip), type, properties }
  const manifest = new Map();
  for (const item of doc.getElementsByTagName("item")) {
    const id = item.getAttribute("id");
    const href = item.getAttribute("href");
    if (!id || !href) continue;
    manifest.set(id, {
      href: resolvePath(baseDir, href),
      type: item.getAttribute("media-type") || "",
      properties: item.getAttribute("properties") || "",
    });
  }

  // spine: thứ tự đọc thực tế
  const spine = [];
  for (const ref of doc.getElementsByTagName("itemref")) {
    const idref = ref.getAttribute("idref");
    const entry = idref && manifest.get(idref);
    if (entry && entry.href) spine.push({ id: idref, href: entry.href });
  }

  // metadata
  const title = firstText(doc, "title") || firstText(doc, "dc:title");
  const author = firstText(doc, "creator") || firstText(doc, "dc:creator");

  // cover image id: meta[name=cover] hoặc item có properties="cover-image"
  let coverId = "";
  for (const meta of doc.getElementsByTagName("meta")) {
    if (meta.getAttribute("name") === "cover") {
      coverId = meta.getAttribute("content") || "";
      break;
    }
  }
  if (!coverId) {
    for (const [id, entry] of manifest) {
      if (entry.properties.split(/\s+/).includes("cover-image")) {
        coverId = id;
        break;
      }
    }
  }
  const cover = coverId ? manifest.get(coverId) : null;

  return { manifest, spine, title, author, cover };
}

// ─── Trích & làm sạch nội dung 1 chương ──────────────────────────────────────

async function extractChapter(rawXhtml, chapterHref, zip, manifest, parser) {
  // "text/html" khoan dung với XHTML lỗi nhẹ hơn "application/xhtml+xml".
  const doc = parser.parseFromString(rawXhtml, "text/html");
  const body = doc.body;
  if (!body) return "";

  // Bỏ các tag không muốn in.
  body.querySelectorAll("script, style, link, audio, video").forEach((el) => el.remove());

  const chapterDir = dirname(chapterHref);

  // Nhúng ảnh <img> thành data URI.
  for (const img of body.querySelectorAll("img")) {
    const src = img.getAttribute("src");
    const dataUri = await resourceToDataUri(zip, chapterDir, src, manifest);
    if (dataUri) {
      img.setAttribute("src", dataUri);
      img.removeAttribute("srcset");
      img.removeAttribute("loading");
    } else {
      img.remove();
    }
  }

  // Ảnh SVG dạng <image xlink:href> (hay dùng cho trang bìa).
  for (const image of body.querySelectorAll("image")) {
    const href =
      image.getAttribute("xlink:href") || image.getAttribute("href");
    const dataUri = await resourceToDataUri(zip, chapterDir, href, manifest);
    if (dataUri) {
      image.setAttribute("xlink:href", dataUri);
      image.setAttribute("href", dataUri);
    }
  }

  // Link nội bộ giữa các chương không dùng được trong PDF ghép → chỉ giữ text.
  for (const a of body.querySelectorAll("a[href]")) {
    const href = a.getAttribute("href") || "";
    if (!/^https?:|^mailto:/i.test(href)) a.removeAttribute("href");
  }

  return body.innerHTML;
}

async function resourceToDataUri(zip, baseDir, ref, manifest) {
  if (!ref) return null;
  const path = resolvePath(baseDir, ref);
  if (!path) return null;
  const bytes = await zipLookup(zip, path);
  if (!bytes) return null;
  const mime = mimeFor(path, manifest);
  return `data:${mime};base64,${bytesToBase64(bytes)}`;
}

async function buildCover(zip, book, parser) {
  if (!book.cover || !book.cover.href) return null;
  const bytes = await zipLookup(zip, book.cover.href);
  if (!bytes) return null;
  const mime = mimeFor(book.cover.href, book.manifest);
  return `data:${mime};base64,${bytesToBase64(bytes)}`;
}

// ─── Ghép tài liệu in ─────────────────────────────────────────────────────────

function assembleDocument(title, author, coverImg, chapters) {
  const coverBlock = coverImg
    ? `<div class="cover"><img src="${coverImg}" alt="Bìa sách"></div>`
    : `<div class="titlepage">
         <h1 class="book-title">${escapeHtml(title)}</h1>
         ${author ? `<p class="book-author">${escapeHtml(author)}</p>` : ""}
       </div>`;

  const chapterBlocks = chapters
    .map((c) => `<section class="chapter">${c}</section>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  @page { margin: 18mm 16mm; size: A4; }
  body {
    font-family: 'Palatino Linotype', 'Book Antiqua', 'Times New Roman', Georgia, serif;
    font-size: 12.5pt;
    line-height: 1.65;
    color: #1a1a1a;
    margin: 0;
    text-align: justify;
    hyphens: auto;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.3;
    text-align: left;
    margin: 1.2em 0 0.5em;
    page-break-after: avoid;
  }
  h1 { font-size: 20pt; }
  h2 { font-size: 16pt; }
  h3 { font-size: 13.5pt; }
  p { margin: 0 0 0.7em; orphans: 2; widows: 2; }
  img { max-width: 100%; height: auto; page-break-inside: avoid; }
  figure { margin: 1em 0; text-align: center; }
  blockquote {
    margin: 1em 1.5em; padding-left: 1em;
    border-left: 3px solid #bbb; color: #444; font-style: italic;
  }
  ul, ol { margin: 0.6em 0; padding-left: 1.6em; }
  table { border-collapse: collapse; margin: 1em 0; }
  th, td { border: 1px solid #ccc; padding: 4px 8px; text-align: left; }
  a { color: inherit; text-decoration: none; }

  .cover { text-align: center; page-break-after: always; }
  .cover img { max-height: 96vh; width: auto; }
  .titlepage {
    display: flex; flex-direction: column; justify-content: center;
    align-items: center; min-height: 90vh; text-align: center;
    page-break-after: always;
  }
  .book-title { font-size: 26pt; margin: 0 0 0.4em; }
  .book-author { font-size: 14pt; color: #555; }

  /* Mỗi chương bắt đầu trang mới (trừ chương đầu đã có bìa/title trước đó). */
  .chapter { page-break-before: always; }
</style>
</head>
<body>
${coverBlock}
${chapterBlocks}
</body>
</html>`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dirname(path) {
  const i = path.lastIndexOf("/");
  return i === -1 ? "" : path.slice(0, i);
}

/** Resolve đường dẫn tương đối (xử lý ./ ../), bỏ #fragment và ?query. */
function resolvePath(baseDir, rel) {
  if (!rel) return null;
  const clean = rel.split("#")[0].split("?")[0];
  if (!clean) return null;
  const stack = baseDir ? baseDir.split("/").filter(Boolean) : [];
  for (const part of clean.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") stack.pop();
    else stack.push(part);
  }
  return stack.join("/");
}

/** Tên entry trong OPF/XHTML có thể bị percent-encode (%20) → thử nhiều biến thể. */
async function zipLookup(zip, path) {
  if (zip.has(path)) return zip.bytes(path);
  try {
    const decoded = decodeURIComponent(path);
    if (decoded !== path && zip.has(decoded)) return zip.bytes(decoded);
  } catch {
    /* path không hợp lệ cho decodeURIComponent → bỏ qua */
  }
  return null;
}

function mimeFor(path, manifest) {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  if (MIME_BY_EXT[ext]) return MIME_BY_EXT[ext];
  if (manifest) {
    for (const entry of manifest.values()) {
      if (entry.href === path && entry.type) return entry.type;
    }
  }
  return "application/octet-stream";
}

function firstText(doc, tag) {
  const els = doc.getElementsByTagName(tag);
  if (els.length && els[0].textContent) return els[0].textContent.trim();
  // Fallback theo local name (bỏ prefix namespace).
  const local = tag.split(":").pop();
  for (const el of doc.getElementsByTagName("*")) {
    if (el.localName === local && el.textContent) return el.textContent.trim();
  }
  return "";
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}
