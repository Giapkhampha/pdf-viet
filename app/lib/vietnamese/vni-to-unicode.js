/**
 * Chuyển văn bản gõ theo keystroke VNI sang Unicode chuẩn.
 *
 * Quy tắc VNI:
 *   1 = sắc  (´)    vd: a1 → á
 *   2 = huyền (`)   vd: a2 → à
 *   3 = hỏi  (̉)    vd: a3 → ả
 *   4 = ngã  (˜)    vd: a4 → ã
 *   5 = nặng (̣)    vd: a5 → ạ
 *   6 = mũ   (^)    vd: a6 → â, e6 → ê, o6 → ô
 *   7 = móc  (˒)    vd: o7 → ơ, u7 → ư
 *   8 = breve (˘)   vd: a8 → ă
 *   9 = stroke      vd: d9 → đ
 *
 * Tổ hợp: a61 → ấ (â + sắc), o72 → ờ (ơ + huyền), v.v.
 * Implementation dùng Unicode combining marks rồi normalize NFC.
 *
 * Hạn chế: chỉ chuyển VNI keystroke (input method), không chuyển VNI font
 * encoding cũ (mỗi ký tự dấu là 1 char riêng) — cần bảng map full sẽ
 * làm sau ở phase tiếp.
 */

// Combining diacritical marks (U+0300..036F + horn U+031B)
const MODIFIER = {
  1: "́", // combining acute (sắc)
  2: "̀", // combining grave (huyền)
  3: "̉", // combining hook above (hỏi)
  4: "̃", // combining tilde (ngã)
  5: "̣", // combining dot below (nặng)
  6: "̂", // combining circumflex (mũ â/ê/ô)
  7: "̛", // combining horn (ơ/ư)
  8: "̆", // combining breve (ă)
};

/**
 * Chuyển 1 chuỗi VNI → Unicode.
 * Match cụm: vowel + 1-3 digit (vd a6, a61, a615 — coi 5 ký tự cuối là tone).
 */
export function vniToUnicode(input) {
  if (!input) return "";

  let result = input;

  // d9 → đ, D9 → Đ (xử lý trước vì 'd' không phải vowel)
  result = result.replace(/d9/g, "đ").replace(/D9/g, "Đ");

  // vowel + chuỗi digit: ép từng digit thành combining mark rồi NFC
  result = result.replace(/([aeiouyAEIOUY])(\d+)/g, (_, vowel, digits) => {
    let combined = vowel;
    // Sắp xếp digit để mũ/móc/breve (6/7/8) xếp trước tone (1-5) — đảm bảo
    // unicode normalize cho ra ký tự gốc + tone đúng vị trí.
    const sorted = [...digits].sort((a, b) => {
      const aIsBase = "678".includes(a) ? 0 : 1;
      const bIsBase = "678".includes(b) ? 0 : 1;
      return aIsBase - bIsBase;
    });
    for (const d of sorted) {
      const mark = MODIFIER[d];
      if (mark) combined += mark;
    }
    return combined.normalize("NFC");
  });

  return result;
}
