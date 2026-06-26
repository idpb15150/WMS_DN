/**
 * Delete all non-HttpOnly cookies available to JS by trying
 * multiple path and domain combinations.
 *
 * NOTE:
 * - HttpOnly cookies cannot be deleted from JS. Server must clear them.
 */
function clearAllCookies(): void {
  try {
    const raw = document.cookie;
    if (!raw) return;

    const cookies = raw.split(";").map((c) => c.trim());
    const hostname = location.hostname;

    // สร้างชุดโดเมนที่จะลองลบ: current host + sub-levels (เช่น app.example.co.th -> .app.example.co.th, .example.co.th, .co.th)
    const parts = hostname.split(".");
    const domains: string[] = [""]; // เริ่มแบบไม่ระบุ domain ก่อน
    for (let i = 0; i < parts.length - 1; i++) {
      const d = "." + parts.slice(i).join(".");
      domains.push(d);
    }
    // path ที่จะลองลบ
    const paths = ["/", location.pathname.split("/").slice(0, 2).join("/") || "/"];

    const expires = "Thu, 01 Jan 1970 00:00:00 GMT";

    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;

      for (const path of paths) {
        // ลบแบบไม่ระบุ domain ก่อน
        document.cookie = `${name}=; expires=${expires}; path=${path}; SameSite=Lax`;
        // ลองลบด้วยแต่ละโดเมน
        for (const domain of domains) {
          document.cookie = `${name}=; expires=${expires}; path=${path}; domain=${domain}; SameSite=Lax`;
        }
      }
    }
  } catch (e) {
    console.warn("clearAllCookies failed:", e);
  }
}