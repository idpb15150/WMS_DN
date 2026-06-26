// =============================================================================
// src/utils/logoutCookies.ts
// -----------------------------------------------------------------------------
// ลบคุกกี้ทั้งหมดตอน Logout เท่านั้น
// แยกออกจาก cookieManager.ts เพื่อให้ชัดเจนว่า
//   "การลบคุกกี้ตอน logout" กับ "การลบคุกกี้ตามปกติ" แยกกันอยู่
// =============================================================================

/**
 * ลบคุกกี้ที่ JS มองเห็นทั้งหมด (ตอน Logout)
 * - ลอง path หลายชุด ( / , first-level path )
 * - ลอง domain หลายชุด (current, sub-levels)
 * - HttpOnly cookies ต้องให้ server ลบผ่าน Set-Cookie
 */
export function clearAllCookiesOnLogout(): void {
  try {
    const raw = document.cookie;
    if (!raw) return;

    const cookies = raw.split(";").map((c) => c.trim());
    const hostname = location.hostname;

    // Domain variants: "", .sub.example.com, .example.com
    const parts = hostname.split(".");
    const domains: string[] = [""];
    for (let i = 0; i < parts.length - 1; i++) {
      const d = "." + parts.slice(i).join(".");
      domains.push(d);
    }

    // Path ที่จะลองลบ
    const paths = ["/", location.pathname.split("/").slice(0, 2).join("/") || "/"];
    const expires = "Thu, 01 Jan 1970 00:00:00 GMT";

    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;

      for (const path of paths) {
        // ลบแบบไม่ระบุ domain ก่อน
        document.cookie = `${name}=; expires=${expires}; path=${path}; SameSite=Lax`;
        // ลองลบด้วยแต่ละ domain
        for (const domain of domains) {
          document.cookie = `${name}=; expires=${expires}; path=${path}; domain=${domain}; SameSite=Lax`;
        }
      }
    }
  } catch (e) {
    console.warn("clearAllCookiesOnLogout failed:", e);
  }
}

/**
 * ลบ localStorage + sessionStorage ทั้งหมด (ตอน Logout)
 */
export function clearAllStorageOnLogout(): void {
  try { localStorage.clear(); } catch { /* ignore */ }
  try { sessionStorage.clear(); } catch { /* ignore */ }
}

/**
 * ลบทุกอย่างฝั่ง client ตอน Logout
 * (cookies + localStorage + sessionStorage)
 */
export function clearAllOnLogout(): void {
  clearAllCookiesOnLogout();
  clearAllStorageOnLogout();
}
