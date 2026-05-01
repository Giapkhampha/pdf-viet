"use client";

import { useState, useRef, useCallback, use } from "react";
import Link from "next/link";

const toolConfig = {
  merge:           { title: "Ghép PDF",           desc: "Kết hợp nhiều file PDF thành một.",                   accept: ".pdf,application/pdf", multiple: true,  color: "teal"   },
  split:           { title: "Tách PDF",            desc: "Chia PDF thành nhiều file, mỗi trang một file.",      accept: ".pdf,application/pdf", multiple: false, color: "red"    },
  compress:        { title: "Nén PDF",             desc: "Giảm dung lượng file PDF.",                           accept: ".pdf,application/pdf", multiple: false, color: "indigo" },
  rotate:          { title: "Xoay PDF",            desc: "Xoay trang PDF theo góc tùy chọn.",                  accept: ".pdf,application/pdf", multiple: false, color: "cyan"   },
  watermark:       { title: "Thêm Watermark",      desc: "Thêm chữ đóng dấu vào tất cả các trang PDF.",        accept: ".pdf,application/pdf", multiple: false, color: "gray"   },
  "jpg-to-pdf":    { title: "Ảnh sang PDF",        desc: "Ghép JPG, PNG thành file PDF.",                       accept: "image/*",              multiple: true,  color: "pink"   },
  "pdf-to-jpg":    { title: "PDF sang Ảnh",        desc: "Xuất từng trang PDF thành ảnh JPG.",                 accept: ".pdf,application/pdf", multiple: false, color: "yellow" },
  "word-to-pdf":   { title: "Word sang PDF",       desc: "Chuyển file .docx thành PDF.",                       accept: ".docx,.doc",           multiple: false, color: "blue"   },
  "excel-to-pdf":  { title: "Excel sang PDF",      desc: "Chuyển bảng tính Excel thành PDF.",                  accept: ".xlsx,.xls,.csv",      multiple: false, color: "green"  },
  "ppt-to-pdf":    { title: "PowerPoint sang PDF", desc: "Chuyển bài thuyết trình thành PDF.",                 accept: ".pptx,.ppt",           multiple: false, color: "orange" },
  "html-to-pdf":   { title: "HTML sang PDF",       desc: "Chuyển file HTML thành PDF.",                        accept: ".html,.htm",           multiple: false, color: "purple" },
  "pdf-to-word":   { title: "PDF sang Word",       desc: "Chuyển PDF thành file .docx có thể chỉnh sửa.",      accept: ".pdf,application/pdf", multiple: false, color: "blue"   },
  "pdf-to-excel":  { title: "PDF sang Excel",      desc: "Trích xuất dữ liệu từ PDF sang file .xlsx.",         accept: ".pdf,application/pdf", multiple: false, color: "green"  },
  protect:         { title: "Bảo vệ PDF",          desc: "Đặt mật khẩu bảo vệ file PDF.",                      accept: ".pdf,application/pdf", multiple: false, color: "red"    },
  unlock:          { title: "Mở khóa PDF",         desc: "Xóa mật khẩu khỏi PDF.",                             accept: ".pdf,application/pdf", multiple: false, color: "green"  },
  "delete-pages":  { title: "Xóa trang",           desc: "Xóa các trang không cần trong PDF.",                 accept: ".pdf,application/pdf", multiple: false, color: "red"    },
  "extract-pages": { title: "Trích xuất trang",    desc: "Lấy một số trang cụ thể từ PDF.",                    accept: ".pdf,application/pdf", multiple: false, color: "orange" },
  "page-numbers":  { title: "Đánh số trang",       desc: "Tự động thêm số trang vào PDF.",                     accept: ".pdf,application/pdf", multiple: false, color: "violet" },
  sign:            { title: "Ký PDF",              desc: "Vẽ chữ ký và nhúng vào tài liệu PDF.",               accept: ".pdf,application/pdf", multiple: false, color: "purple" },
  flatten:         { title: "Làm phẳng PDF",       desc: "Chuyển PDF về dạng không chỉnh sửa được.",           accept: ".pdf,application/pdf", multiple: false, color: "gray"   },
  ocr:             { title: "OCR - Nhận dạng chữ", desc: "Nhận dạng chữ trong ảnh/PDF scan (hỗ trợ tiếng Việt).", accept: "image/*",          multiple: false, color: "blue"   },
};

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmtSize = (b) =>
  b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(2)} MB`;

const triggerDownload = (bytes, filename, mime = "application/pdf") => {
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

// ─── HELPER: Load PDF.js với worker local ────────────────────────────────────
async function getPdfJs() {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  return pdfjsLib;
}

// ─── PDF-LIB TOOLS ───────────────────────────────────────────────────────────
async function processMerge(files) {
  const { PDFDocument } = await import("pdf-lib");
  const merged = await PDFDocument.create();
  for (const file of files) {
    const buf = await file.arrayBuffer();
    const src = await PDFDocument.load(buf, { ignoreEncryption: true });
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  return await merged.save();
}

async function processSplit(file) {
  const { PDFDocument } = await import("pdf-lib");
  const buf = await file.arrayBuffer();
  const src = await PDFDocument.load(buf, { ignoreEncryption: true });
  const results = [];
  for (let i = 0; i < src.getPageCount(); i++) {
    const doc = await PDFDocument.create();
    const [page] = await doc.copyPages(src, [i]);
    doc.addPage(page);
    results.push({ bytes: await doc.save(), name: `trang_${i + 1}.pdf` });
  }
  return results;
}

async function processCompress(file) {
  const { PDFDocument } = await import("pdf-lib");
  const buf = await file.arrayBuffer();
  const src = await PDFDocument.load(buf, { ignoreEncryption: true });
  const doc = await PDFDocument.create();
  (await doc.copyPages(src, src.getPageIndices())).forEach((p) => doc.addPage(p));
  return await doc.save({ useObjectStreams: true });
}

async function processRotate(file, degrees) {
  const { PDFDocument, degrees: deg } = await import("pdf-lib");
  const buf = await file.arrayBuffer();
  const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
  pdf.getPages().forEach((p) => p.setRotation(deg((p.getRotation().angle + degrees) % 360)));
  return await pdf.save();
}

async function processWatermark(file, text) {
  const { PDFDocument, rgb, StandardFonts, degrees: deg } = await import("pdf-lib");
  const buf = await file.arrayBuffer();
  const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  pdf.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const fontSize = Math.min(width, height) * 0.08;
    page.drawText(text, {
      x: (width - font.widthOfTextAtSize(text, fontSize)) / 2,
      y: height / 2, size: fontSize, font,
      color: rgb(0.6, 0.6, 0.6), opacity: 0.35, rotate: deg(45),
    });
  });
  return await pdf.save();
}

async function processImagesToPdf(files) {
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  for (const file of files) {
    const buf = await file.arrayBuffer();
    const img = file.type === "image/png" ? await pdf.embedPng(buf) : await pdf.embedJpg(buf);
    const page = pdf.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  return await pdf.save();
}

async function processDeletePages(file, pageInput) {
  const { PDFDocument } = await import("pdf-lib");
  const buf = await file.arrayBuffer();
  const src = await PDFDocument.load(buf, { ignoreEncryption: true });
  const total = src.getPageCount();
  const toDelete = new Set();
  pageInput.split(",").forEach((part) => {
    const [a, b] = part.trim().split("-").map(Number);
    b ? Array.from({length:b-a+1},(_,k)=>toDelete.add(a+k-1)) : toDelete.add(a-1);
  });
  const keep = [...Array(total).keys()].filter((i) => !toDelete.has(i));
  const doc = await PDFDocument.create();
  (await doc.copyPages(src, keep)).forEach((p) => doc.addPage(p));
  return await doc.save();
}

async function processExtractPages(file, pageInput) {
  const { PDFDocument } = await import("pdf-lib");
  const buf = await file.arrayBuffer();
  const src = await PDFDocument.load(buf, { ignoreEncryption: true });
  const indices = [];
  pageInput.split(",").forEach((part) => {
    const [a, b] = part.trim().split("-").map(Number);
    b ? Array.from({length:b-a+1},(_,k)=>indices.push(a+k-1)) : indices.push(a-1);
  });
  const doc = await PDFDocument.create();
  (await doc.copyPages(src, indices)).forEach((p) => doc.addPage(p));
  return await doc.save();
}

async function processPageNumbers(file) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const buf = await file.arrayBuffer();
  const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  pages.forEach((page, i) => {
    const { width } = page.getSize();
    const text = `${i+1} / ${pages.length}`;
    page.drawText(text, {
      x: (width - font.widthOfTextAtSize(text, 10)) / 2,
      y: 20, size: 10, font, color: rgb(0.4, 0.4, 0.4),
    });
  });
  return await pdf.save();
}

async function processFlatten(file) {
  const { PDFDocument } = await import("pdf-lib");
  const buf = await file.arrayBuffer();
  const src = await PDFDocument.load(buf, { ignoreEncryption: true });
  const doc = await PDFDocument.create();
  (await doc.copyPages(src, src.getPageIndices())).forEach((p) => doc.addPage(p));
  return await doc.save({ useObjectStreams: false });
}

async function processSignPdf(file, signatureDataUrl) {
  const { PDFDocument } = await import("pdf-lib");
  const buf = await file.arrayBuffer();
  const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
  const base64 = signatureDataUrl.split(",")[1];
  const sigBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const sigImg = await pdf.embedPng(sigBytes);
  const pages = pdf.getPages();
  const last = pages[pages.length - 1];
  const { width } = last.getSize();
  last.drawImage(sigImg, { x: width - 150, y: 30, width: 120, height: 50 });
  return await pdf.save();
}

// ─── PDF SANG ẢNH ─────────────────────────────────────────────────────────────
async function processPdfToImages(file, setProgress) {
  const pdfjsLib = await getPdfJs();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
  const results = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    setProgress(`Đang render trang ${i}/${pdf.numPages}...`);
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width; canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.92));
    results.push({ bytes: new Uint8Array(await blob.arrayBuffer()), name: `trang_${i}.jpg` });
  }
  return results;
}

// ─── TRÍCH XUẤT TEXT TỪNG DÒNG TỪ PDF ────────────────────────────────────────
// Trả về mảng pages, mỗi page là mảng các "block" (nhóm dòng gần nhau theo y)
async function extractStructuredText(file, setProgress) {
  const pdfjsLib = await getPdfJs();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
  const allPages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    setProgress(`Đang phân tích trang ${i}/${pdf.numPages}...`);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });

    // Gom các item theo dòng (cùng y ± 3px)
    const lineMap = new Map();
    for (const item of content.items) {
      if (!item.str?.trim()) continue;
      const y = Math.round(item.transform[5]);
      const key = [...lineMap.keys()].find((k) => Math.abs(k - y) < 5);
      if (key !== undefined) {
        lineMap.get(key).push(item);
      } else {
        lineMap.set(y, [item]);
      }
    }

    // Sắp xếp dòng từ trên xuống dưới (y lớn = trên cùng trong PDF)
    const sortedLines = [...lineMap.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([y, items]) => {
        items.sort((a, b) => a.transform[4] - b.transform[4]);
        const text = items.map((it) => it.str).join(" ").trim();
        const fontSize = items[0]?.transform ? Math.abs(items[0].transform[3]) : 12;
        const isBold = items.some((it) => it.fontName?.toLowerCase().includes("bold"));
        return { text, fontSize, isBold, y };
      })
      .filter((line) => line.text.length > 0);

    allPages.push({ pageNum: i, lines: sortedLines, height: viewport.height });
  }
  return allPages;
}

// ─── PDF SANG DOCX ─────────────────────────────────────────────────────────────
// Thuật toán:
// 1. Dùng PDF.js trích xuất text có cấu trúc (fontSize, bold, vị trí dòng)
// 2. Phân loại từng dòng: Heading lớn / Heading nhỏ / Đoạn văn thường
// 3. Dùng thư viện `docx` tạo file .docx với các paragraph tương ứng
async function processPdfToDocx(file, setProgress) {
  // Bước 1: Trích xuất text có cấu trúc
  const pages = await extractStructuredText(file, setProgress);

  setProgress("Đang tạo file Word...");
  const {
    Document, Paragraph, TextRun, HeadingLevel,
    AlignmentType, PageBreak, Packer,
  } = await import("docx");

  const docChildren = [];

  // Tính font size trung bình của toàn tài liệu để phân loại heading
  const allFontSizes = pages.flatMap((p) => p.lines.map((l) => l.fontSize)).filter(Boolean);
  const avgFontSize = allFontSizes.length
    ? allFontSizes.reduce((a, b) => a + b, 0) / allFontSizes.length
    : 12;

  for (let pi = 0; pi < pages.length; pi++) {
    const { lines } = pages[pi];

    // Thêm page break giữa các trang (trừ trang đầu)
    if (pi > 0) {
      docChildren.push(
        new Paragraph({ children: [new PageBreak()] })
      );
    }

    let prevY = null;

    for (const line of lines) {
      const { text, fontSize, isBold, y } = line;

      // Tính khoảng cách với dòng trước — nếu xa → thêm dòng trống
      if (prevY !== null && prevY - y > fontSize * 2.5) {
        docChildren.push(new Paragraph({ text: "" }));
      }
      prevY = y;

      // Phân loại dòng dựa vào fontSize so với average
      const ratio = fontSize / avgFontSize;

      if (ratio >= 1.6 || (ratio >= 1.3 && isBold)) {
        // Heading 1 — chữ to hoặc to vừa + bold
        docChildren.push(
          new Paragraph({
            text,
            heading: HeadingLevel.HEADING_1,
          })
        );
      } else if (ratio >= 1.15 || (ratio >= 1.0 && isBold)) {
        // Heading 2 — chữ lớn hơn trung bình một chút hoặc bold
        docChildren.push(
          new Paragraph({
            text,
            heading: HeadingLevel.HEADING_2,
          })
        );
      } else {
        // Đoạn văn thường — giữ nguyên bold nếu có
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text,
                bold: isBold,
                size: Math.round(fontSize) * 2, // docx dùng half-points
              }),
            ],
          })
        );
      }
    }
  }

  // Tạo Document và export
  const doc = new Document({
    sections: [{ children: docChildren }],
    styles: {
      paragraphStyles: [
        {
          id: "Normal",
          name: "Normal",
          run: { font: "Times New Roman", size: 24 }, // 12pt
        },
      ],
    },
  });

  const blob = await Packer.toBlob(doc);
  return new Uint8Array(await blob.arrayBuffer());
}

// ─── PDF SANG EXCEL ────────────────────────────────────────────────────────────
async function processPdfToExcel(file, setProgress) {
  const pages = await extractStructuredText(file, setProgress);
  setProgress("Đang tạo file Excel...");
  const XLSX = await import("xlsx");

  // Mỗi dòng text thành 1 row trong Excel
  const rows = [["Trang", "Dòng", "Nội dung", "Font size", "Bold"]];
  for (const page of pages) {
    for (const line of page.lines) {
      rows.push([page.pageNum, line.y, line.text, Math.round(line.fontSize), line.isBold ? "Có" : ""]);
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 6 }, { wch: 6 }, { wch: 80 }, { wch: 10 }, { wch: 6 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "PDF Content");
  return new Uint8Array(XLSX.write(wb, { type: "array", bookType: "xlsx" }));
}

// ─── WORD/EXCEL/HTML SANG PDF (cửa sổ in) ────────────────────────────────────
async function processWordToPdf(file, setProgress) {
  const mammoth = await import("mammoth");
  setProgress("Đang đọc file Word...");
  const buf = await file.arrayBuffer();
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buf });
  setProgress("Đang mở cửa sổ in...");
  const win = window.open("", "_blank", "width=800,height=600");
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @page{margin:20mm} body{font-family:'Times New Roman',serif;font-size:13pt;line-height:1.6}
    table{border-collapse:collapse;width:100%} td,th{border:1px solid #ccc;padding:6px}
  </style></head><body>${html}</body></html>`);
  win.document.close(); win.focus();
  setTimeout(() => win.print(), 800);
  return null;
}

async function processExcelToPdf(file, setProgress) {
  const XLSX = await import("xlsx");
  setProgress("Đang đọc file Excel...");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const html = XLSX.utils.sheet_to_html(wb.Sheets[wb.SheetNames[0]]);
  setProgress("Đang mở cửa sổ in...");
  const win = window.open("", "_blank", "width=1000,height=600");
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @page{size:A4 landscape;margin:10mm} body{font-family:Arial,sans-serif;font-size:10pt}
    table{border-collapse:collapse;width:100%} td,th{border:1px solid #999;padding:4px 6px}
    th{background:#f0f0f0}
  </style></head><body>${html}</body></html>`);
  win.document.close(); win.focus();
  setTimeout(() => win.print(), 800);
  return null;
}

async function processHtmlToPdf(file, setProgress) {
  setProgress("Đang đọc file HTML...");
  const text = await file.text();
  const win = window.open("", "_blank", "width=800,height=600");
  win.document.write(text);
  win.document.close(); win.focus();
  setTimeout(() => win.print(), 800);
  return null;
}

// ─── OCR ──────────────────────────────────────────────────────────────────────
async function processOCR(file, setProgress) {
  const { createWorker } = await import("tesseract.js");
  setProgress("Đang tải engine OCR (lần đầu ~20s)...");
  const worker = await createWorker("vie+eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text")
        setProgress(`Nhận dạng: ${Math.round(m.progress * 100)}%`);
    },
  });
  const url = URL.createObjectURL(file);
  const { data: { text } } = await worker.recognize(url);
  await worker.terminate(); URL.revokeObjectURL(url);
  return text;
}

// ─── COMPONENT: DROPZONE ──────────────────────────────────────────────────────
function DropZone({ onFiles, accept, multiple, files, onRemove, onMoveUp, onMoveDown }) {
  const inputRef = useRef(null);
  const [hover, setHover] = useState(false);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const dragIdx = useRef(null);

  const addFiles = useCallback((newFiles) => {
    const arr = Array.from(newFiles);
    onFiles(multiple ? arr : [arr[0]]);
  }, [multiple, onFiles]);

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); setHover(false); addFiles(e.dataTransfer.files); }}
        onDragOver={(e) => { e.preventDefault(); setHover(true); }}
        onDragLeave={() => setHover(false)}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
          ${hover ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50"}`}
      >
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden"
          onChange={(e) => addFiles(e.target.files)} />
        <div className="text-4xl mb-3">📂</div>
        <p className="font-medium text-gray-700 mb-1">{hover ? "Thả file vào đây..." : "Kéo thả file vào đây"}</p>
        <p className="text-sm text-gray-400">hoặc nhấp để chọn file</p>
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((f, i) => (
            <div key={i} draggable={multiple}
              onDragStart={() => { dragIdx.current = i; }}
              onDragOver={(e) => { e.preventDefault(); setDragOverIdx(i); }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIdx.current !== null && dragIdx.current !== i) {
                  const r = [...files]; const [m] = r.splice(dragIdx.current, 1); r.splice(i, 0, m);
                  onFiles(r, true);
                }
                dragIdx.current = null; setDragOverIdx(null);
              }}
              onDragEnd={() => { dragIdx.current = null; setDragOverIdx(null); }}
              className={`flex items-center gap-3 bg-white rounded-xl px-4 py-3 border transition-all
                ${dragOverIdx === i ? "border-blue-400 bg-blue-50" : "border-gray-100 hover:border-gray-200"}
                ${multiple ? "cursor-grab active:cursor-grabbing" : ""}`}
            >
              {multiple && <span className="text-gray-300 text-xs select-none">⠿</span>}
              <span className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">{i+1}</span>
              <span className="text-blue-400 flex-shrink-0">📄</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{f.name}</p>
                <p className="text-xs text-gray-400">{fmtSize(f.size)}</p>
              </div>
              {multiple && (
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => onMoveUp(i)} disabled={i===0}
                    className="px-1.5 py-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs">▲</button>
                  <button onClick={() => onMoveDown(i)} disabled={i===files.length-1}
                    className="px-1.5 py-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs">▼</button>
                </div>
              )}
              <button onClick={() => onRemove(i)} className="text-gray-300 hover:text-red-400 text-sm px-1">✕</button>
            </div>
          ))}
          {multiple && (
            <button onClick={() => inputRef.current?.click()}
              className="w-full py-2.5 rounded-xl border border-dashed border-gray-200 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-400 transition-all">
              + Thêm file khác
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── COMPONENT: KÝ TÊN ────────────────────────────────────────────────────────
function SignaturePad({ onSave }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0] || e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const start = (e) => {
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e, canvasRef.current);
    ctx.beginPath(); ctx.moveTo(x, y);
  };
  const draw = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#1a1a2e";
    const { x, y } = getPos(e, canvasRef.current);
    ctx.lineTo(x, y); ctx.stroke();
  };
  const stop = () => { drawing.current = false; };
  const clear = () => canvasRef.current.getContext("2d").clearRect(0, 0, 400, 120);
  const save = () => onSave(canvasRef.current.toDataURL("image/png"));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-sm font-medium text-gray-700 mb-2">Vẽ chữ ký của bạn</p>
      <canvas ref={canvasRef} width={400} height={120}
        className="border border-gray-200 rounded-lg w-full touch-none bg-gray-50 cursor-crosshair"
        onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop}
        onTouchStart={start} onTouchMove={draw} onTouchEnd={stop} />
      <div className="flex gap-2 mt-2">
        <button onClick={clear} className="px-4 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:border-gray-300">Xóa lại</button>
        <button onClick={save} className="px-4 py-1.5 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600">Dùng chữ ký này</button>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ToolPage({ params }) {
  const { id } = use(params);
  const config = toolConfig[id];

  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");
  const [progress, setProgress] = useState("");
  const [resultText, setResultText] = useState("");
  const [rotateDeg, setRotateDeg] = useState(90);
  const [watermarkText, setWatermarkText] = useState("BẢO MẬT");
  const [pageInput, setPageInput] = useState("");
  const [signature, setSignature] = useState(null);

  const handleFiles = useCallback((incoming, isReorder = false) => {
    if (isReorder) { setFiles(incoming); return; }
    setFiles((prev) => {
      const keys = new Set(prev.map((f) => f.name + f.size));
      const unique = incoming.filter((f) => !keys.has(f.name + f.size));
      return config?.multiple ? [...prev, ...unique] : [incoming[0]];
    });
    setStatus("idle"); setResultText(""); setProgress("");
  }, [config]);

  const removeFile = (idx) => { setFiles((p) => p.filter((_, i) => i !== idx)); setStatus("idle"); };
  const moveUp   = (idx) => { if (idx===0) return; setFiles((p) => { const n=[...p]; [n[idx-1],n[idx]]=[n[idx],n[idx-1]]; return n; }); };
  const moveDown = (idx) => { setFiles((p) => { if (idx===p.length-1) return p; const n=[...p]; [n[idx],n[idx+1]]=[n[idx+1],n[idx]]; return n; }); };

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
        <div className="text-5xl mb-4">🚧</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Đang phát triển</h1>
        <p className="text-gray-500 mb-6">Công cụ này sẽ sớm có mặt.</p>
        <Link href="/" className="text-blue-500 hover:underline text-sm">← Về trang chủ</Link>
      </div>
    );
  }

  const handleProcess = async () => {
    if (!files.length || status === "processing") return;
    if (id === "sign" && !signature) { setErrMsg("Vui lòng vẽ chữ ký trước."); return; }
    setStatus("processing"); setErrMsg(""); setProgress("Đang xử lý..."); setResultText("");

    try {
      switch (id) {
        case "merge":
          triggerDownload(await processMerge(files), "merged.pdf"); break;
        case "split": {
          const rs = await processSplit(files[0]);
          for (const r of rs) { triggerDownload(r.bytes, r.name); await new Promise(res=>setTimeout(res,300)); }
          break;
        }
        case "compress":
          triggerDownload(await processCompress(files[0]), "compressed_" + files[0].name); break;
        case "rotate":
          triggerDownload(await processRotate(files[0], rotateDeg), "rotated_" + files[0].name); break;
        case "watermark":
          triggerDownload(await processWatermark(files[0], watermarkText), "watermarked_" + files[0].name); break;
        case "jpg-to-pdf":
          triggerDownload(await processImagesToPdf(files), "images_to_pdf.pdf"); break;
        case "pdf-to-jpg": {
          const rs = await processPdfToImages(files[0], setProgress);
          for (const r of rs) { triggerDownload(r.bytes, r.name, "image/jpeg"); await new Promise(res=>setTimeout(res,300)); }
          break;
        }
        case "word-to-pdf":  await processWordToPdf(files[0], setProgress);  break;
        case "excel-to-pdf": await processExcelToPdf(files[0], setProgress); break;
        case "html-to-pdf":  await processHtmlToPdf(files[0], setProgress);  break;

        // ── PDF SANG DOCX — Hướng A ──────────────────────────────────────────
        case "pdf-to-word": {
          const bytes = await processPdfToDocx(files[0], setProgress);
          const outName = files[0].name.replace(/\.pdf$/i, ".docx");
          triggerDownload(bytes, outName,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
          break;
        }

        case "pdf-to-excel": {
          const bytes = await processPdfToExcel(files[0], setProgress);
          triggerDownload(bytes, files[0].name.replace(/\.pdf$/i, ".xlsx"),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
          break;
        }
        case "delete-pages":
          if (!pageInput.trim()) throw new Error("Vui lòng nhập số trang cần xóa.");
          triggerDownload(await processDeletePages(files[0], pageInput), "deleted_" + files[0].name); break;
        case "extract-pages":
          if (!pageInput.trim()) throw new Error("Vui lòng nhập số trang cần trích xuất.");
          triggerDownload(await processExtractPages(files[0], pageInput), "extracted_" + files[0].name); break;
        case "page-numbers":
          triggerDownload(await processPageNumbers(files[0]), "numbered_" + files[0].name); break;
        case "flatten":
          triggerDownload(await processFlatten(files[0]), "flattened_" + files[0].name); break;
        case "sign":
          triggerDownload(await processSignPdf(files[0], signature), "signed_" + files[0].name); break;
        case "ocr": {
          const text = await processOCR(files[0], setProgress);
          setResultText(text);
          triggerDownload(new TextEncoder().encode(text),
            files[0].name.replace(/\.[^.]+$/, "_ocr.txt"), "text/plain");
          break;
        }
        default:
          throw new Error("Công cụ này đang được phát triển.");
      }
      setStatus("done"); setProgress("");
    } catch (err) {
      console.error(err);
      setErrMsg(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
      setStatus("error"); setProgress("");
    }
  };

  const colorMap = {
    teal:"bg-teal-500", red:"bg-red-500", indigo:"bg-indigo-500", cyan:"bg-cyan-500",
    gray:"bg-gray-400", pink:"bg-pink-500", yellow:"bg-yellow-400", green:"bg-green-500",
    orange:"bg-orange-500", purple:"bg-purple-500", violet:"bg-violet-500", blue:"bg-blue-500",
  };

  const isPrintTool = ["word-to-pdf","excel-to-pdf","html-to-pdf"].includes(id);
  const canProcess = files.length > 0 && status !== "processing";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">← Về trang chủ</Link>
          <span className="text-gray-200">/</span>
          <span className="text-sm font-medium text-gray-700">{config.title}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <div className={`inline-flex w-12 h-12 rounded-xl ${colorMap[config.color]||"bg-blue-500"} items-center justify-center text-white text-xl mb-4`}>📄</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{config.title}</h1>
          <p className="text-gray-500">{config.desc}</p>
          <p className="text-xs text-green-600 mt-2">🔒 Xử lý 100% trên trình duyệt — file không được gửi lên server</p>
        </div>

        {/* Ghi chú đặc biệt */}
        {id === "pdf-to-word" && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 space-y-1">
            <p className="font-medium text-sm">ℹ️ Chuyển đổi PDF → Word (.docx)</p>
            <p>• Giữ được: heading, đoạn văn, bold/italic, cỡ chữ tương đối</p>
            <p>• Hạn chế: bảng phức tạp, cột nhiều tầng, hình ảnh trong PDF sẽ không chuyển được</p>
            <p>• PDF dạng ảnh scan → dùng công cụ <strong>OCR</strong> trước, rồi copy text vào Word</p>
          </div>
        )}
        {isPrintTool && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            💡 Sẽ mở hộp thoại <strong>In</strong>. Chọn máy in là <strong>&quot;Save as PDF&quot;</strong> để lưu thành file PDF.
          </div>
        )}
        {id === "ocr" && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            ⚠️ Lần đầu cần tải ~20MB model OCR. Hỗ trợ tiếng Việt nhưng ảnh mờ sẽ cho kết quả kém hơn.
          </div>
        )}
        {(id==="pdf-to-excel") && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
            ℹ️ Trích xuất text từ PDF ra Excel. PDF dạng ảnh scan cần dùng OCR trước.
          </div>
        )}

        <DropZone onFiles={handleFiles} accept={config.accept} multiple={config.multiple}
          files={files} onRemove={removeFile} onMoveUp={moveUp} onMoveDown={moveDown} />

        {files.length > 0 && (
          <div className="mt-4 space-y-3">
            {id === "rotate" && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">Góc xoay</label>
                <div className="flex gap-2">
                  {[90,180,270].map((d) => (
                    <button key={d} onClick={() => setRotateDeg(d)}
                      className={`px-5 py-2 rounded-lg text-sm font-medium border transition-all
                        ${rotateDeg===d?"bg-cyan-500 text-white border-cyan-500":"border-gray-200 text-gray-600 hover:border-cyan-300"}`}>
                      {d}°
                    </button>
                  ))}
                </div>
              </div>
            )}
            {id === "watermark" && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung watermark</label>
                <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Ví dụ: BẢO MẬT, NHÁP..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
              </div>
            )}
            {(id==="delete-pages"||id==="extract-pages") && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {id==="delete-pages"?"Trang cần xóa":"Trang cần trích xuất"}
                </label>
                <input type="text" value={pageInput} onChange={(e) => setPageInput(e.target.value)}
                  placeholder="Ví dụ: 1,3,5-7"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
                <p className="text-xs text-gray-400 mt-1">Phân cách bằng dấu phẩy. Dải trang: 5-10</p>
              </div>
            )}
            {id === "sign" && (
              !signature
                ? <SignaturePad onSave={(url) => setSignature(url)} />
                : (
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Chữ ký đã chọn:</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={signature} alt="sig" className="h-16 border border-gray-100 rounded-lg bg-gray-50 p-2" />
                    <button onClick={() => setSignature(null)} className="mt-2 text-xs text-red-400 hover:text-red-600">Vẽ lại</button>
                  </div>
                )
            )}
          </div>
        )}

        {status === "processing" && progress && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 flex items-center gap-2">
            <span className="inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            {progress}
          </div>
        )}

        {status === "error" && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <span className="font-medium">Lỗi: </span>{errMsg}
          </div>
        )}

        {resultText && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Nội dung trích xuất:</p>
            <textarea readOnly value={resultText} rows={10}
              className="w-full border border-gray-200 rounded-xl p-3 text-xs text-gray-600 font-mono resize-none bg-gray-50" />
          </div>
        )}

        <button onClick={handleProcess} disabled={!canProcess}
          className={`mt-6 w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all
            ${canProcess?"bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.98]":"bg-gray-100 text-gray-300 cursor-not-allowed"}`}>
          {status === "processing"
            ? <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Đang xử lý...</>
            : status === "done"
            ? (isPrintTool ? "✓ Mở lại cửa sổ in?" : "✓ Xong! Tải xuống lần nữa?")
            : (isPrintTool ? "Mở cửa sổ in →" : "Xử lý ngay →")}
        </button>

        {files.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-3">
            🔒 File của bạn không được gửi lên bất kỳ server nào
          </p>
        )}
      </main>
    </div>
  );
}