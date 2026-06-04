/**
 * Chuyển đổi lịch âm ↔ dương theo lịch Việt Nam (UTC+7).
 *
 * Thuật toán dựa trên công trình của TS. Hồ Ngọc Đức:
 *   https://www.informatik.uni-leipzig.de/~duc/amlich/calrules.html
 *
 * Port sang JavaScript thuần, không phụ thuộc thư viện ngoài. Đã kiểm chéo
 * với một số ngày Tết quen thuộc (2024 = Giáp Thìn, 2025 = Ất Tỵ, ...).
 */

const PI = Math.PI;
const TIMEZONE = 7; // Vietnam UTC+7

const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

function INT(d) {
  return Math.floor(d);
}

// Julian day number từ ngày dương lịch
function jdFromDate(dd, mm, yy) {
  const a = INT((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd =
    dd +
    INT((153 * m + 2) / 5) +
    365 * y +
    INT(y / 4) -
    INT(y / 100) +
    INT(y / 400) -
    32045;
  if (jd < 2299161) {
    jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  }
  return jd;
}

// Julian day → ngày dương lịch
function jdToDate(jd) {
  let a, b, c;
  if (jd > 2299160) {
    a = jd + 32044;
    b = INT((4 * a + 3) / 146097);
    c = a - INT((146097 * b) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = INT((4 * c + 3) / 1461);
  const e = c - INT((1461 * d) / 4);
  const m = INT((5 * e + 2) / 153);
  const day = e - INT((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * INT(m / 10);
  const year = b * 100 + d - 4800 + INT(m / 10);
  return [day, month, year];
}

// Số ngày kể từ 1/1/4713 BC tới điểm new moon thứ k (Meeus)
function newMoon(k) {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = PI / 180;
  let Jd1 =
    2415020.75933 +
    29.53058868 * k +
    0.0001178 * T2 -
    0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 -= 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 += 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 -= 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 -= 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 += 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  let deltat;
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  return Jd1 + C1 - deltat;
}

// Solar longitude (radians) ở thời điểm Julian day jdn
function sunLongitude(jdn) {
  const T = (jdn - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = L0 + DL;
  L = L * dr;
  L = L - PI * 2 * INT(L / (PI * 2));
  return L;
}

function getSunLongitude(dayNumber, timeZone) {
  return INT((sunLongitude(dayNumber - 0.5 - timeZone / 24) / PI) * 6);
}

function getNewMoonDay(k, timeZone) {
  return INT(newMoon(k) + 0.5 + timeZone / 24);
}

function getLunarMonth11(yy, timeZone) {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = INT(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

function getLeapMonthOffset(a11, timeZone) {
  const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

/**
 * Dương → Âm.
 * @returns {{ day, month, year, isLeapMonth }}
 */
export function convertSolar2Lunar(dd, mm, yy) {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = INT((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, TIMEZONE);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, TIMEZONE);
  }
  let a11 = getLunarMonth11(yy, TIMEZONE);
  let b11 = a11;
  let lunarYear;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, TIMEZONE);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, TIMEZONE);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = INT((monthStart - a11) / 29);
  let lunarLeap = 0;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, TIMEZONE);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        lunarLeap = 1;
      }
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;

  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    isLeapMonth: lunarLeap === 1,
  };
}

/**
 * Âm → Dương.
 * @returns {{ day, month, year }}
 */
export function convertLunar2Solar(lunarDay, lunarMonth, lunarYear, lunarLeap = false) {
  let a11, b11;
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, TIMEZONE);
    b11 = getLunarMonth11(lunarYear, TIMEZONE);
  } else {
    a11 = getLunarMonth11(lunarYear, TIMEZONE);
    b11 = getLunarMonth11(lunarYear + 1, TIMEZONE);
  }
  const k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let off = lunarMonth - 11;
  if (off < 0) off += 12;
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, TIMEZONE);
    let leapMonth = leapOff - 2;
    if (leapMonth < 0) leapMonth += 12;
    if (lunarLeap && lunarMonth !== leapMonth) {
      return null; // tháng này không nhuận
    }
    if (lunarLeap || off >= leapOff) {
      off += 1;
    }
  }
  const monthStart = getNewMoonDay(k + off, TIMEZONE);
  const jd = monthStart + lunarDay - 1;
  const [day, month, year] = jdToDate(jd);
  return { day, month, year };
}

/**
 * Can Chi cho 1 ngày dương lịch — bộ 3 (ngày, tháng, năm).
 */
export function getCanChi(dd, mm, yy) {
  const lunar = convertSolar2Lunar(dd, mm, yy);
  const jd = jdFromDate(dd, mm, yy);

  // Can Chi ngày: tính từ jd
  const dayCan = CAN[(jd + 9) % 10];
  const dayChi = CHI[(jd + 1) % 12];

  // Can Chi năm âm
  const yearCan = CAN[(lunar.year + 6) % 10];
  const yearChi = CHI[(lunar.year + 8) % 12];

  // Can Chi tháng âm
  const monthBase = lunar.year * 12 + lunar.month + 3;
  const monthCan = CAN[monthBase % 10];
  const monthChi = CHI[(lunar.month + 1) % 12];

  return {
    day: `${dayCan} ${dayChi}`,
    month: `${monthCan} ${monthChi}`,
    year: `${yearCan} ${yearChi}`,
  };
}

export { CAN, CHI };
