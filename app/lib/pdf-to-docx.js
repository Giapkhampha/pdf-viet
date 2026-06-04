import { extractStructuredText } from "@/app/lib/pdf-structured-extract";

/**
 * Chuyển PDF → DOCX:
 *  1. Trích xuất text có cấu trúc (fontSize, bold, vị trí)
 *  2. Phân loại heading 1 / heading 2 / đoạn văn dựa trên fontSize so với
 *     fontSize trung bình toàn tài liệu
 *  3. Render thành Document của thư viện `docx`
 *
 * Hạn chế: bảng, hình ảnh, cột nhiều tầng sẽ không giữ được.
 */
export async function pdfToDocx(file, onProgress) {
  const pages = await extractStructuredText(file, onProgress);

  onProgress?.("Đang tạo file Word...");
  const {
    Document, Paragraph, TextRun, HeadingLevel, PageBreak, Packer,
  } = await import("docx");

  const docChildren = [];

  const allFontSizes = pages.flatMap((p) => p.lines.map((l) => l.fontSize)).filter(Boolean);
  const avgFontSize = allFontSizes.length
    ? allFontSizes.reduce((a, b) => a + b, 0) / allFontSizes.length
    : 12;

  for (let pi = 0; pi < pages.length; pi++) {
    const { lines } = pages[pi];

    if (pi > 0) {
      docChildren.push(new Paragraph({ children: [new PageBreak()] }));
    }

    let prevY = null;
    for (const line of lines) {
      const { text, fontSize, isBold, y } = line;

      // Khoảng cách lớn giữa 2 dòng → thêm dòng trống để giữ ngắt đoạn
      if (prevY !== null && prevY - y > fontSize * 2.5) {
        docChildren.push(new Paragraph({ text: "" }));
      }
      prevY = y;

      const ratio = fontSize / avgFontSize;
      if (ratio >= 1.6 || (ratio >= 1.3 && isBold)) {
        docChildren.push(new Paragraph({ text, heading: HeadingLevel.HEADING_1 }));
      } else if (ratio >= 1.15 || (ratio >= 1.0 && isBold)) {
        docChildren.push(new Paragraph({ text, heading: HeadingLevel.HEADING_2 }));
      } else {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text,
                bold: isBold,
                size: Math.round(fontSize) * 2, // half-points
              }),
            ],
          })
        );
      }
    }
  }

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
