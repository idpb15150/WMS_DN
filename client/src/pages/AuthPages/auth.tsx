// utils/auth.ts
export function isAuthenticated(): boolean {
  const cookies = document.cookie.split(";").map((c) => c.trim());
  return cookies.some(
    (c) => c.startsWith("auth_token=") || c.startsWith("authToken=")
  );
}
