/**
 * ZIP writer tối giản — 0 dependency.
 *
 * Cặp đôi với `unzip.js` (đọc EPUB). File này *ghi* ZIP để tạo EPUB.
 * Mọi entry được lưu dạng "stored" (method 0, không nén) → không cần
 * CompressionStream, không cần thư viện, đúng cam kết "repo nhẹ".
 *
 * EPUB có 1 yêu cầu đặc biệt: entry `mimetype` phải đứng đầu và ở dạng
 * stored — `buildZip` giữ nguyên thứ tự mảng entries đưa vào nên chỉ cần
 * đặt `mimetype` ở phần tử đầu tiên.
 */

// ─── CRC32 (bảng tra chuẩn) ──────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const encoder = new TextEncoder();

function toBytes(data) {
  return typeof data === "string" ? encoder.encode(data) : data;
}

/**
 * Ghép nhiều entry thành 1 file ZIP.
 *
 * @param {Array<{name: string, data: string|Uint8Array}>} entries
 *   Thứ tự mảng = thứ tự trong ZIP (đặt `mimetype` đầu tiên cho EPUB).
 * @returns {Uint8Array} nội dung file ZIP hoàn chỉnh.
 */
export function buildZip(entries) {
  const localParts = [];
  const central = [];
  let offset = 0;

  // Thời gian DOS cố định (1980-01-01) — EPUB không quan tâm, giữ deterministic.
  const dosTime = 0;
  const dosDate = 0x21; // 1980-01-01

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const dataBytes = toBytes(entry.data);
    const crc = crc32(dataBytes);
    const size = dataBytes.length;

    // ── Local file header ──
    const lfh = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(lfh.buffer);
    lv.setUint32(0, 0x04034b50, true); // signature
    lv.setUint16(4, 20, true); // version needed
    lv.setUint16(6, 0, true); // flags
    lv.setUint16(8, 0, true); // method = stored
    lv.setUint16(10, dosTime, true);
    lv.setUint16(12, dosDate, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true); // compressed size
    lv.setUint32(22, size, true); // uncompressed size
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // extra len
    lfh.set(nameBytes, 30);

    localParts.push(lfh, dataBytes);

    // ── Central directory header ──
    const cdh = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(cdh.buffer);
    cv.setUint32(0, 0x02014b50, true); // signature
    cv.setUint16(4, 20, true); // version made by
    cv.setUint16(6, 20, true); // version needed
    cv.setUint16(8, 0, true); // flags
    cv.setUint16(10, 0, true); // method
    cv.setUint16(12, dosTime, true);
    cv.setUint16(14, dosDate, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true); // extra len
    cv.setUint16(32, 0, true); // comment len
    cv.setUint16(34, 0, true); // disk number
    cv.setUint16(36, 0, true); // internal attrs
    cv.setUint32(38, 0, true); // external attrs
    cv.setUint32(42, offset, true); // local header offset
    cdh.set(nameBytes, 46);
    central.push(cdh);

    offset += lfh.length + dataBytes.length;
  }

  const centralSize = central.reduce((n, c) => n + c.length, 0);
  const centralOffset = offset;

  // ── End of central directory ──
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true); // disk
  ev.setUint16(6, 0, true); // disk with CD
  ev.setUint16(8, entries.length, true); // entries this disk
  ev.setUint16(10, entries.length, true); // total entries
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, centralOffset, true);
  ev.setUint16(20, 0, true); // comment len

  // Ghép tất cả thành 1 Uint8Array.
  const totalSize = offset + centralSize + eocd.length;
  const out = new Uint8Array(totalSize);
  let p = 0;
  for (const part of localParts) {
    out.set(part, p);
    p += part.length;
  }
  for (const c of central) {
    out.set(c, p);
    p += c.length;
  }
  out.set(eocd, p);
  return out;
}
