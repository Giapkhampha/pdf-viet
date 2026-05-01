/**
 * Convert extracted PDF pages (from pdf-extract.js) to a Markdown string.
 *
 * Phase A logic (intentionally simple):
 *   - Group items on the same line by Y coordinate (within LINE_Y_TOLERANCE px)
 *   - Sort lines top-to-bottom (PDF Y axis is bottom-up, so sort descending)
 *   - Merge lines into paragraphs when vertical gap < PARAGRAPH_GAP_THRESHOLD px
 *   - Escape Markdown special chars found in raw text
 *   - Optionally prepend "# {fileName}" and "## Trang N" headings
 */

const LINE_Y_TOLERANCE = 2; // px — items within this range share a line
const PARAGRAPH_GAP_THRESHOLD = 15; // px — gap larger than this = new paragraph

const MD_ESCAPE_RE = /([\\`*_{}[\]()#+\-.!|])/g;

function escapeMd(text) {
  return text.replace(MD_ESCAPE_RE, "\\$1");
}

/**
 * Group text items into lines (arrays of items sharing the same Y).
 * Returns lines sorted top-to-bottom (highest Y first in PDF coords).
 */
function groupIntoLines(items) {
  const lines = [];

  for (const item of items) {
    const existing = lines.find((l) => Math.abs(l.y - item.y) <= LINE_Y_TOLERANCE);
    if (existing) {
      existing.items.push(item);
    } else {
      lines.push({ y: item.y, items: [item] });
    }
  }

  // PDF Y-axis is bottom-up → sort descending to get reading order
  lines.sort((a, b) => b.y - a.y);

  // Within each line, sort items left-to-right
  for (const line of lines) {
    line.items.sort((a, b) => a.x - b.x);
  }

  return lines;
}

/**
 * Merge lines into paragraphs based on vertical gap.
 * Returns array of paragraph strings.
 */
function groupIntoParagraphs(lines) {
  if (lines.length === 0) return [];

  const paragraphs = [];
  let currentLines = [lines[0]];

  for (let i = 1; i < lines.length; i++) {
    const prevY = lines[i - 1].y;
    const currY = lines[i].y;
    const gap = Math.abs(prevY - currY);

    if (gap > PARAGRAPH_GAP_THRESHOLD) {
      paragraphs.push(currentLines);
      currentLines = [lines[i]];
    } else {
      currentLines.push(lines[i]);
    }
  }
  paragraphs.push(currentLines);

  return paragraphs.map((group) =>
    group
      .map((line) => line.items.map((item) => escapeMd(item.text)).join(" "))
      .join(" ")
      .trim()
  );
}

/**
 * @param {Array<{ pageNumber: number, items: Array<{text, x, y, fontSize, fontName}> }>} extractedData
 * @param {{ includePageNumbers?: boolean, fileName?: string }} options
 * @returns {string} Markdown string
 */
export function toMarkdown(extractedData, options = {}) {
  const { includePageNumbers = true, fileName } = options;

  const sections = [];

  if (fileName) {
    const cleanName = fileName.replace(/\.pdf$/i, "");
    sections.push(`# ${escapeMd(cleanName)}\n`);
  }

  for (const page of extractedData) {
    const lines = groupIntoLines(page.items);
    const paragraphs = groupIntoParagraphs(lines);

    const pageLines = [];

    if (includePageNumbers) {
      pageLines.push(`## Trang ${page.pageNumber}`);
      pageLines.push("");
    }

    for (const para of paragraphs) {
      if (para.trim()) {
        pageLines.push(para.trim());
        pageLines.push("");
      }
    }

    if (pageLines.length > 0) {
      sections.push(pageLines.join("\n"));
    }
  }

  return sections.join("\n").trimEnd() + "\n";
}

/**
 * Check if extracted data looks like a scanned PDF (no/very little text).
 * Heuristic: average fewer than 5 text items per page.
 * More reliable than a fixed total — avoids false positives on short single-page PDFs.
 */
export function isLikelyScan(extractedData) {
  if (extractedData.length === 0) return true;
  const totalItems = extractedData.reduce((sum, page) => sum + page.items.length, 0);
  return totalItems / extractedData.length < 5;
}
