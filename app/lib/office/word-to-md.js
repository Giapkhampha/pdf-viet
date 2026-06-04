/**
 * Word (.docx) → Markdown.
 *
 * Cách dùng `mammoth`: convert sang HTML rồi convert HTML → MD (tự viết
 * converter đơn giản). Mammoth không có API `convertToMarkdown` trực tiếp,
 * nhưng HTML output đủ structured để chuyển đổi 1-1 cho phần lớn case.
 */
export async function wordToMarkdown(file) {
  const mammoth = await import("mammoth");
  const buf = await file.arrayBuffer();

  // Mammoth convert sang HTML với mapping style mặc định
  const { value: html, messages } = await mammoth.convertToHtml({ arrayBuffer: buf });

  const md = htmlToMarkdown(html);
  return { markdown: md, warnings: messages.filter((m) => m.type === "warning") };
}

/**
 * HTML → Markdown converter đơn giản. Cover các case mammoth output thường:
 * h1-h6, p, strong, em, a, ul/ol/li, blockquote, code/pre, br, hr, img.
 */
function htmlToMarkdown(html) {
  if (!html) return "";
  // Dùng DOMParser của browser — chỉ chạy client (component sẽ wrap "use client")
  const doc = new DOMParser().parseFromString(html, "text/html");
  return nodeToMd(doc.body).replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

function nodeToMd(node) {
  if (!node) return "";
  if (node.nodeType === 3) return node.textContent; // text node
  if (node.nodeType !== 1) return "";

  const tag = node.tagName.toLowerCase();
  const inner = childrenToMd(node);

  switch (tag) {
    case "h1": return `\n# ${inner}\n\n`;
    case "h2": return `\n## ${inner}\n\n`;
    case "h3": return `\n### ${inner}\n\n`;
    case "h4": return `\n#### ${inner}\n\n`;
    case "h5": return `\n##### ${inner}\n\n`;
    case "h6": return `\n###### ${inner}\n\n`;
    case "p":  return `${inner}\n\n`;
    case "strong":
    case "b":  return `**${inner}**`;
    case "em":
    case "i":  return `*${inner}*`;
    case "u":  return inner; // MD không có underline chuẩn
    case "code": return `\`${inner}\``;
    case "pre":  return `\n\`\`\`\n${inner}\n\`\`\`\n\n`;
    case "blockquote": return inner.split("\n").map((l) => `> ${l}`).join("\n") + "\n\n";
    case "a": {
      const href = node.getAttribute("href") || "";
      return `[${inner}](${href})`;
    }
    case "img": {
      const src = node.getAttribute("src") || "";
      const alt = node.getAttribute("alt") || "";
      return `![${alt}](${src})`;
    }
    case "ul": return listToMd(node, false);
    case "ol": return listToMd(node, true);
    case "li": return inner; // được xử lý trong listToMd
    case "br": return "  \n";
    case "hr": return "\n---\n\n";
    case "table": return tableToMd(node);
    default: return inner;
  }
}

function childrenToMd(node) {
  return [...node.childNodes].map(nodeToMd).join("");
}

function listToMd(listNode, ordered) {
  const items = [...listNode.children].filter((c) => c.tagName.toLowerCase() === "li");
  return (
    items
      .map((li, i) => {
        const marker = ordered ? `${i + 1}.` : "-";
        const content = childrenToMd(li).trim();
        return `${marker} ${content}`;
      })
      .join("\n") + "\n\n"
  );
}

function tableToMd(table) {
  const rows = [...table.querySelectorAll("tr")];
  if (rows.length === 0) return "";
  const cells = rows.map((tr) => [...tr.children].map((td) => childrenToMd(td).trim()));
  const colCount = Math.max(...cells.map((r) => r.length));
  const out = [];
  out.push("| " + cells[0].concat(Array(colCount - cells[0].length).fill("")).join(" | ") + " |");
  out.push("|" + Array(colCount).fill(" --- ").join("|") + "|");
  for (const row of cells.slice(1)) {
    out.push("| " + row.concat(Array(colCount - row.length).fill("")).join(" | ") + " |");
  }
  return "\n" + out.join("\n") + "\n\n";
}
