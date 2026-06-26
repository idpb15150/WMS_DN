// ============================================================================
// File: src/components/auth/TokenRotator.tsx
// ----------------------------------------------------------------------------
// - หมุน (rotate) token ตามรอบเวลาแบบค่าคงที่ตัวเลขล้วน
// - เมื่อได้ token ใหม่ ให้เริ่มนับอายุคุกกี้ใหม่ 15 นาทีเสมอ
// - ชื่อคุกกี้: auth_token, auth_payload
// - ใช้ path แบบ relative ไปที่ /APIAuthentication/... เพื่อวิ่งผ่าน Vite proxy
// ============================================================================

import { useContext, useEffect, useRef } from "react";
import { apiAuth } from "../../api/apiAuth";
import { AuthContext } from "../../pages/AuthPages/AuthContext";

// Endpoint หมุน token
const AUTH_ROTATE_URL = "/APIAuthentication/api/Authentication/rotate";
// อายุคุกกี้ 15 นาที แบบกำหนดตัวเลขตรง ๆ (หน่วยวินาที)
const COOKIE_MAX_AGE_SECONDS = 900;
// ตั้งเวลา rotate ใหม่ 14 นาที แบบกำหนดตัวเลขตรง ๆ (หน่วยมิลลิวินาที)
const ROTATE_DELAY_MS = 840000;

/** ---------- Utils เดิม ---------- */
function setCookie(name: string, value: string, maxAgeSeconds: number) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}
function readCookie(name: string): string | null {
  const parts = document.cookie.split("; ").filter(Boolean);
  for (const p of parts) {
    const [k, ...rest] = p.split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}
function pickTokenFlexible(d: any): string {
  if (!d) return "";

  // ✅ เจาะรูปแบบที่ได้จริงจาก API: { success, data: { token, ... } }
  const tokenFromData = d?.data?.token;
  if (typeof tokenFromData === "string" && tokenFromData.trim()) {
    return tokenFromData.trim();
  }

  // เผื่อ API อื่น (ไม่กระทบระบบพี่)
  const fallback =
    d.token ??
    d.accessToken ??
    d.access_token ??
    d.jwt ??
    d?.data?.accessToken ??
    d?.data?.access_token ??
    "";

  return typeof fallback === "string" ? fallback.trim() : "";
}
/** ---------- NEW: ดึง ADUSER จาก localStorage/cookie/auth_payload ---------- */
function getFromLocalStorage(key: string): string | null {
  try {
    const v = window.localStorage.getItem(key);
    return v ? v.trim() : null;
  } catch {
    return null;
  }
}
function getAuthPayload(): any | null {
  const raw = readCookie("auth_payload");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function pickAdUserFlexible(obj: any): string | null {
  if (!obj) return null;
  const candidates = [
    "ADUSER", "aduser",
    "AD_USER", "ad_user",
    "ADAccount", "adAccount",
    "samaccountname", "sAMAccountName",
    "adUser", "AdUser"
  ];
  const keys = Object.keys(obj);
  const hit = keys.find(k => candidates.includes(k));
  const val = hit ? obj[hit] : null;
  const s = val == null ? "" : String(val).trim();
  return s || null;
}
function getAdUser(): string | null {
  // 1) localStorage
  const fromLS = getFromLocalStorage("auth_aduser");
  if (fromLS) return fromLS;

  // 2) cookie (ชื่อเดียวกัน)
  const fromCookie = readCookie("auth_aduser");
  if (fromCookie && fromCookie.trim()) return fromCookie.trim();

  // 3) auth_payload fields ที่เป็นไปได้
  const payload = getAuthPayload();
  const fromPayload =
    pickAdUserFlexible(payload) ||
    pickAdUserFlexible(payload?.data) ||
    pickAdUserFlexible(payload?.user);

  return fromPayload ?? null;
}

/** ---------- Component ---------- */
export default function TokenRotator({ enabled = true }: { enabled?: boolean }) {
  const { authData, setAuthData } = useContext(AuthContext);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ล้าง timer เมื่อ component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // EXPOSE DevTools helpers: window.rotateTokenNow(), window.setAdUser()
  useEffect(() => {
    async function rotateNow() {
      const cookieToken = readCookie("auth_token") ?? "";
      const stateToken = authData?.token ?? "";
      const previousJti = cookieToken || stateToken;

      const aduser = getAdUser();
      if (!aduser) throw new Error("auth_aduser is empty");

      const res = await apiAuth.post(
        AUTH_ROTATE_URL,
        { username: aduser, previousJti },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      const data: any = res.data;

      // ✅ map จาก data.data.* ตาม response จริง
      const msg = data?.data?.message ?? "Authenticated";
      const cn = data?.data?.commonname ?? getAdUser() ?? "";

      // ✅ ดึง token ให้ชัวร์
      const newToken = pickTokenFlexible(data);
      if (!newToken) {
        throw new Error("Rotate endpoint did not return a token (expected at data.data.token)");
      }

      const now = Date.now();
      const expiresAt = new Date(now + 900000).toISOString(); // 15 นาที

      const updatedPayload = {
        ...(authData ?? {}),
        message: msg,
        commonname: cn,
        token: newToken,
        issuedAt: new Date(now).toISOString(),
        expiresAt,
      };


      setAuthData(updatedPayload as any);
      setCookie("auth_token", encodeURIComponent(newToken), COOKIE_MAX_AGE_SECONDS);
      setCookie("auth_payload", encodeURIComponent(JSON.stringify(updatedPayload)), COOKIE_MAX_AGE_SECONDS);
    }

    // @ts-ignore
    window.rotateTokenNow = rotateNow;

    // @ts-ignore
    window.setAdUser = (val) => {
      const v = String(val ?? "").trim();
      if (!v) throw new Error("aduser is empty");
      try { localStorage.setItem("auth_aduser", v); } catch { }
      document.cookie = `auth_aduser=${encodeURIComponent(v)}; Path=/; SameSite=Lax`;
      return window.rotateTokenNow();
    };

    return () => {
      // @ts-ignore
      if (window.rotateTokenNow) delete window.rotateTokenNow;
      // @ts-ignore
      if (window.setAdUser) delete window.setAdUser;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authData?.token]); // เปลี่ยน token แล้วยังเรียกใช้ได้

  // ตั้ง timer สำหรับการหมุน token เป็นรอบ ๆ
  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // อ่าน token ปัจจุบันจาก cookie ก่อน (fallback เป็น state)
    const cookieToken = readCookie("auth_token") ?? "";
    const stateToken = authData?.token ?? "";
    const currentToken = cookieToken || stateToken;

    if (!currentToken) {
      // ไม่มี token - ไม่ต้องตั้ง timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // เคลียร์ของเดิมก่อน
    if (timerRef.current) clearTimeout(timerRef.current);

    // ตั้งรอบการหมุนใหม่
    timerRef.current = setTimeout(async () => {
      try {
        const aduser = getAdUser();
        if (!aduser) throw new Error("auth_aduser is empty");

        const previousJti = readCookie("auth_token") ?? stateToken;

        const res = await apiAuth.post(
          AUTH_ROTATE_URL,
          { username: aduser, previousJti },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );

        const data: any = res.data;
        const newToken = pickTokenFlexible(data);
        if (!newToken) {
          throw new Error("Rotate endpoint did not return a token in data.token");
        }

        // อัปเดต Context + คุกกี้
        const now = Date.now();
        const expiresAt = new Date(now + 900000).toISOString(); // 15 นาที
        const updatedPayload = {
          ...(authData ?? {}),
          message: data?.data?.message ?? "Authenticated",
          commonname: data?.data?.commonname ?? aduser,
          token: newToken,
          issuedAt: new Date(now).toISOString(),
          expiresAt,
        };
        setAuthData(updatedPayload as any);
        setCookie("auth_token", encodeURIComponent(newToken), COOKIE_MAX_AGE_SECONDS);
        setCookie("auth_payload", encodeURIComponent(JSON.stringify(updatedPayload)), COOKIE_MAX_AGE_SECONDS);
        // หมายเหตุ: setAuthData จะทำให้ useEffect นี้รันอีกครั้งและตั้ง timer รอบใหม่ให้อัตโนมัติ
      } catch (e) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    }, ROTATE_DELAY_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, authData?.token]);

  return null; // ไม่เรนเดอร์ UI
}