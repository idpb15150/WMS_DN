import React, { useCallback, useState } from "react";

type LogoutButtonProps = {
  children?: React.ReactNode;  // You can pass <span>Sign out</span> or an icon
  redirectTo?: string;         // default: "/login"
  onBefore?: () => Promise<void> | void;  // hook before logout (e.g., flush logs)
  onAfter?: () => Promise<void> | void;   // hook after local cleanup but before redirect
  apiEndpoint?: string;        // optional: e.g., "/api/auth/logout"
  method?: "POST" | "GET";     // default: "POST"
  body?: Record<string, any>;  // optional body for POST
};

const DEFAULT_REDIRECT = "/login";

const clearLocalSession = () => {
  try {
    // Adjust to your keys
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    // If you store anything login-related in cookies, clear them here
    // document.cookie = "sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  } catch (e) {
    console.warn("Local session cleanup failed:", e);
  }
};

export default function LogoutButton({
  children,
  redirectTo = DEFAULT_REDIRECT,
  onBefore,
  onAfter,
  apiEndpoint,
  method = "POST",
  body,
}: LogoutButtonProps) {
  const [busy, setBusy] = useState(false);

  const doLogout = useCallback(async () => {
    if (busy) return;
    setBusy(true);

    try {
      // 1) Optional hook
      await onBefore?.();

      // 2) Optional server-side logout
      if (apiEndpoint) {
        try {
          // No external packages; browser fetch only
          await fetch(apiEndpoint, {
            method,
            headers: {
              "Content-Type": "application/json",
              // If you need to pass token:
              // Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
            },
            body: method === "POST" ? JSON.stringify(body || {}) : undefined,
            credentials: "include", // if your server sets httpOnly cookies
          });
        } catch (e) {
          // Non-blocking — even if API fails, proceed with local cleanup
          console.warn("Logout API failed (will continue local logout):", e);
        }
      }

      // 3) Local cleanup
      clearLocalSession();

      // 4) Optional hook
      await onAfter?.();
    } finally {
      // 5) Redirect (do last)
      window.location.assign(redirectTo);
      setBusy(false);
    }
  }, [apiEndpoint, method, body, onBefore, onAfter, redirectTo, busy]);

  return (
    <button
      type="button"
      onClick={doLogout}
      disabled={busy}
      style={{
        background: "transparent",
        border: 0,
        padding: 0,
        cursor: busy ? "not-allowed" : "pointer",
      }}
      aria-busy={busy}
      aria-label="Sign out"
    >
      {children ?? "Sign out"}
    </button>
  );
}