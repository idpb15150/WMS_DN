// src/utils/safeStorage.ts
type GetOpts = { fromCookie?: boolean };
type SetOpts = { maxAgeSeconds?: number; domain?: string; secure?: boolean; sameSite?: 'Lax' | 'Strict' | 'None' };

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const re = new RegExp('(?:^|; )' + name.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&') + '=([^;]*)');
  const m = document.cookie.match(re);
  return m ? decodeURIComponent(m[1]) : null;
}

function setCookie(name: string, value: string, opts: SetOpts = {}) {
  if (typeof document === 'undefined') return;
  const { maxAgeSeconds = 60 * 60 * 24 * 7, domain, secure, sameSite = 'Lax' } = opts;
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=${sameSite}`;
  if (domain) cookie += `; Domain=${domain}`;
  if (secure) cookie += `; Secure`;
  document.cookie = cookie;
}

function delCookie(name: string, domain?: string) {
  if (typeof document === 'undefined') return;
  let cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0`;
  if (domain) cookie += `; Domain=${domain}`;
  document.cookie = cookie;
}

function hasLocalStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const k = '__ls_test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export const safeStorage = {
  get(key: string, opts: GetOpts = {}): string | null {
    if (hasLocalStorage()) {
      try {
        return window.localStorage.getItem(key);
      } catch {}
    }
    if (opts.fromCookie !== false) return getCookie(key);
    return null;
  },
  set(key: string, value: string, opts: SetOpts = {}) {
    if (hasLocalStorage()) {
      try {
        window.localStorage.setItem(key, value);
      } catch {}
    }
    setCookie(key, value, opts);
  },
  remove(key: string, domain?: string) {
    if (hasLocalStorage()) {
      try {
        window.localStorage.removeItem(key);
      } catch {}
    }
    delCookie(key, domain);
  },
  defaultCookieDomain(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    const envDomain = (import.meta as any)?.env?.VITE_COOKIE_DOMAIN as string | undefined;
    if (envDomain) return envDomain;
    const parts = window.location.hostname.split('.');
    if (parts.length >= 2) return parts.slice(-2).join('.');
    return undefined;
  },
  defaultCookieSecure(): boolean {
    if (typeof window === 'undefined') return true;
    return window.location.protocol === 'https:';
  },
};