// utils/auth-utils.ts
export type AuthPayload = {
  message: string; commonname: string; token: string;
  role: string | null; user: any; hrValue: string;
  issuedAt: string; expiresAt: string;
};

export function getAuthPayloadFromCookie(): AuthPayload | null {
  const m = document.cookie.match(/(?:^|; )auth_payload=([^;]*)/);
  if (!m) return null;
  try {
    return JSON.parse(decodeURIComponent(m[1])) as AuthPayload;
  } catch {
    return null;
  }
}