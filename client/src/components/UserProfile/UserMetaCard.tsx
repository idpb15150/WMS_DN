import { useEffect, useState } from "react";
import { useAuth } from "../../pages/AuthPages/AuthContext";
import { jwtDecode } from "jwt-decode";

type CookieData = {
  user: string;
  commonName: string;
  authToken: string;
  decodedToken: any | null;
};

function readCookies(): Record<string, string> {
  const out: Record<string, string> = {};
  if (typeof document === "undefined") return out;
  (document.cookie ? document.cookie.split(";") : []).forEach(part => {
    const [k, v] = part.trim().split("=");
    out[k] = decodeURIComponent(v ?? "");
  });
  return out;
}

// URL-safe base64 → standard + padding แล้วค่อย atob
function toStdB64(s: string) {
  let x = s.replace(/-/g, "+").replace(/_/g, "/");
  while (x.length % 4 !== 0) x += "=";
  return x;
}
function maybeB64Decode(s?: string | null) {
  const v = (s ?? "").trim();
  if (!v) return "";
  // เงื่อนไขคร่าว ๆ ว่า "น่าจะ" เป็น base64
  if (/^[A-Za-z0-9+/_-]+={0,2}$/.test(v) && v.replace(/=/g, "").length >= 4) {
    try {
      const dec = atob(toStdB64(v));
      // เฉพาะกรณีที่เป็นข้อความ (ไม่ใช่ binary)
      if (/^[\u0009\u000A\u000D\u0020-\u007E\u00A0-\uFFFF]+$/.test(dec)) return dec;
    } catch {}
  }
  return v;
}

export default function UserMetaCard() {
  const { authData } = useAuth();
  const [cookieData, setCookieData] = useState<CookieData>({
    user: "",
    commonName: "",
    authToken: "",
    decodedToken: null,
  });

  useEffect(() => {
    const cookies = readCookies();
    const token = cookies.auth_token ?? cookies.authToken ?? "";
    let decodedToken: any | null = null;
    if (token) {
      try { decodedToken = jwtDecode(token); } catch { decodedToken = null; }
    }
    setCookieData({
      user: maybeB64Decode(cookies.user ?? ""),
      commonName: cookies.commonName ?? "",
      authToken: token,
      decodedToken,
    });
  }, []);

  // รวม candidate แล้ว normalize
  const lsUserObj = (() => {
    try { return JSON.parse(localStorage.getItem("auth_user") || "null"); } catch { return null; }
  })();

  const displayUser =
    maybeB64Decode(
      authData?.commonname ??
      lsUserObj?.username ??
      localStorage.getItem("auth_commonname") ??
      cookieData.decodedToken?.cn ??
      cookieData.commonName ??
      cookieData.user ??
      ""
    ) || "-";

  const displayRole =
    authData?.role ??
    localStorage.getItem("auth_role") ??
    (lsUserObj?.role ?? "") ||
    "No Role";

  return (
    <>
      <div>User: {displayUser}</div>
      <div>Role: {displayRole}</div>
    </>
  );
}