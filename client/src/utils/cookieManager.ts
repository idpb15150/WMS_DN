// =============================================================================
// src/utils/cookieManager.ts
// -----------------------------------------------------------------------------
// ศูนย์กลางจัดการ Cookie ทั้งโปรเจค
//   - getCookie   → อ่าน cookie
//   - setCookie   → ตั้ง cookie (ไม่มีวันหมดอายุ)
//   - deleteCookie → ลบ cookie ชื่อเดียว
//
// หมายเหตุ: การลบ cookie ตอน logout ให้ใช้ logoutCookies.ts แทน
// =============================================================================

/** อ่านค่า cookie ตามชื่อ */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const re = new RegExp(
    "(?:^|; )" + name.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&") + "=([^;]*)"
  );
  const m = document.cookie.match(re);
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * ตั้งค่า cookie โดยไม่มีวันหมดอายุ
 * (ใช้ Expires ไกลสุดที่เบราว์เซอร์รองรับ)
 */
export function setCookie(
  name: string,
  value: string,
  opts: {
    path?: string;
    sameSite?: "Lax" | "Strict" | "None";
    secure?: boolean;
  } = {}
): void {
  if (typeof document === "undefined") return;

  const path = opts.path ?? "/";
  const sameSite = opts.sameSite ?? "Lax";
  const secure =
    opts.secure !== undefined
      ? opts.secure
      : location.protocol === "https:";

  // Expires ไกลที่สุดที่ทุก browser รองรับ (RFC 2616 / compat)
  const FOREVER = "Fri, 31 Dec 9999 23:59:59 GMT";

  let cookie =
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}` +
    `; Path=${path}` +
    `; Expires=${FOREVER}` +
    `; SameSite=${sameSite}`;

  if (secure) cookie += "; Secure";

  document.cookie = cookie;
}

/**
 * ลบ cookie ชื่อเดียว (ลองทุก path/domain combination)
 * ใช้สำหรับลบ cookie เฉพาะตัวเมื่อไม่ต้องการแล้ว
 * → ถ้าต้องการลบทั้งหมดตอน logout ให้ใช้ logoutCookies.ts
 */
export function deleteCookie(name: string, domain?: string): void {
  if (typeof document === "undefined") return;

  const expired = "Thu, 01 Jan 1970 00:00:00 GMT";
  const paths = ["/", location.pathname.split("/").slice(0, 2).join("/") || "/"];

  for (const path of paths) {
    document.cookie = `${encodeURIComponent(name)}=; Expires=${expired}; Path=${path}; SameSite=Lax`;
    if (domain) {
      document.cookie = `${encodeURIComponent(name)}=; Expires=${expired}; Path=${path}; Domain=${domain}; SameSite=Lax`;
    }
  }
}
