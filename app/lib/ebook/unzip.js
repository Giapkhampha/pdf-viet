/**
 * ZIP reader tối giản — 0 dependency.
 *
 * EPUB thực chất là 1 file ZIP chứa XHTML + CSS + ảnh. Thay vì cài thư viện
 * unzip (jszip ~100KB), ta tự parse cấu trúc ZIP và giải nén bằng API native
 * của trình duyệt `DecompressionStream("deflate-raw")` — đúng cam kết
 * "repo nhẹ, không cài thêm package".
 *
 * Chỉ hỗ trợ 2 method phổ biến trong EPUB: 0 (stored) và 8 (deflate).
 * Đọc central directory để lấy danh sách entry rồi giải nén theo yêu cầu.
 */

const textDecoder = new TextDecoder("utf-8");

const u16 = (dv, off) => dv.getUint16(off, true);
const u32 = (dv, off) => dv.getUint32(off, true);

// Chữ ký các record trong ZIP
const SIG_EOCD = 0x06054b50; // End Of Central Directory
const SIG_CDH = 0x02014b50; // Central Directory Header
const SIG_LFH = 0x04034b50; // Local File Header (không dùng trực tiếp nhưng để tham chiếu)

async function inflateRaw(bytes) {
  if (typeof DecompressionStream === "undefined") {
    throw new Error(
      "Trình duyệt của bạn chưa hỗ trợ giải nén EPUB. Vui lòng dùng Chrome, Edge, hoặc Firefox bản mới."
    );
  }
  const ds = new DecompressionStream("deflate-raw");
  const stream = new Blob([bytes]).stream().pipeThrough(ds);
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

/**
 * Tìm End Of Central Directory record — nằm gần cuối file, có thể có comment
 * ở sau (tối đa 65535 byte) nên phải quét ngược.
 */
function findEOCD(bytes, dv) {
  const minLen = 22;
  if (bytes.length < minLen) return null;
  const scanFrom = bytes.length - minLen;
  const scanTo = Math.max(0, bytes.length - minLen - 65535);
  for (let i = scanFrom; i >= scanTo; i--) {
    if (u32(dv, i) === SIG_EOCD) {
      return { count: u16(dv, i + 10), cdOffset: u32(dv, i + 16) };
    }
  }
  return null;
}

/**
 * Đọc 1 file ZIP (ArrayBuffer) → object có API đọc entry theo tên.
 *
 * @param {ArrayBuffer} arrayBuffer
 * @returns {{
 *   names: () => string[],
 *   has: (name: string) => boolean,
 *   bytes: (name: string) => Promise<Uint8Array|null>,
 *   text:  (name: string) => Promise<string|null>,
 * }}
 */
export async function readZip(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const dv = new DataView(arrayBuffer);

  const eocd = findEOCD(bytes, dv);
  if (!eocd) {
    throw new Error("File không phải EPUB hợp lệ (không tìm thấy cấu trúc ZIP).");
  }

  // Duyệt central directory để lập bảng entry.
  const entries = new Map();
  let ptr = eocd.cdOffset;
  for (let i = 0; i < eocd.count; i++) {
    if (ptr + 46 > bytes.length || u32(dv, ptr) !== SIG_CDH) break;
    const method = u16(dv, ptr + 10);
    const compSize = u32(dv, ptr + 20);
    const nameLen = u16(dv, ptr + 28);
    const extraLen = u16(dv, ptr + 30);
    const commentLen = u16(dv, ptr + 32);
    const localOff = u32(dv, ptr + 42);
    const name = textDecoder.decode(bytes.subarray(ptr + 46, ptr + 46 + nameLen));
    entries.set(name, { method, compSize, localOff });
    ptr += 46 + nameLen + extraLen + commentLen;
  }

  async function rawBytes(name) {
    const e = entries.get(name);
    if (!e) return null;
    // Local file header có thể có extra length khác với central dir → phải
    // đọc lại nameLen/extraLen tại chính local header để tính offset data.
    const lhNameLen = u16(dv, e.localOff + 26);
    const lhExtraLen = u16(dv, e.localOff + 28);
    const dataStart = e.localOff + 30 + lhNameLen + lhExtraLen;
    const data = bytes.subarray(dataStart, dataStart + e.compSize);
    if (e.method === 0) return data.slice(); // stored — copy ra buffer riêng
    if (e.method === 8) return inflateRaw(data);
    throw new Error(`Định dạng nén trong EPUB chưa được hỗ trợ (method ${e.method}).`);
  }

  return {
    names: () => [...entries.keys()],
    has: (name) => entries.has(name),
    bytes: rawBytes,
    async text(name) {
      const b = await rawBytes(name);
      return b ? textDecoder.decode(b) : null;
    },
  };
}

// SIG_LFH chỉ mang tính tài liệu — tránh cảnh báo "unused".
export const _SIGNATURES = { SIG_EOCD, SIG_CDH, SIG_LFH };
