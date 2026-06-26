import { safeStorage } from "../utils/safeStorage";
import { getCookie } from "../utils/cookieManager";

const JWT_NAMES = ["Authorization", "auth_token", "access_token", "jwt", "id_token"];
const SESSION_NAMES = [".AspNetCore.Session", ".AspNetCore.Cookies", "idsrv.session", "ASPXAUTH"];

function readCookie(name: string): string | null {
  return getCookie(name);
}

export function isLikelyJwt(token: unknown): token is string {
  if (typeof token !== "string") return false;
  if (!/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(token)) return false;
  const parts = token.split(".");
  return parts.length === 3;
}

export function getAuthSnapshot() {
  let jwt: string | null = null;
  let session: string | null = null;

  for (const n of JWT_NAMES) {
    const v = readCookie(n);
    if (v && v.startsWith("Bearer ")) {
      const t = v.slice(7).trim();
      if (isLikelyJwt(t)) { jwt = t; break; }
    }
    if (!jwt && v && isLikelyJwt(v)) { jwt = v; }
  }
  if (!jwt) {
    for (const k of ["auth_token", "access_token", "jwt"]) {
      const v = safeStorage.get(k);
      if (v && isLikelyJwt(v)) { jwt = v; break; }
    }
  }

  for (const n of SESSION_NAMES) {
    const v = readCookie(n);
    if (v) { session = v; break; }
  }
  if (!session) {
    const v = safeStorage.get("session_token");
    if (v) session = v;
  }

  return { jwt, session };
}

export function persistTokenFlexible(token: string) {
  if (!token) return;
  if (isLikelyJwt(token)) {
    safeStorage.set("auth_token", token);
    safeStorage.set("access_token", token);
    safeStorage.set("jwt", token);
    document.cookie = `Authorization=${encodeURIComponent("Bearer " + token)}; Path=/; SameSite=Lax`;
  } else {
    safeStorage.set("session_token", token);
  }
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const { jwt } = getAuthSnapshot();
  const headers = new Headers(init.headers || {});
  if (jwt && !headers.has("Authorization")) headers.set("Authorization", "Bearer " + jwt);
  return fetch(input, { ...init, credentials: "include", headers });
}