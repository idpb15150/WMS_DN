import { createContext, useEffect, useMemo, useState } from "react";
import { getCookie } from "../../utils/cookieManager";
import { clearAllOnLogout } from "../../utils/logoutCookies";

type AuthData = {
  token?: string;
  commonname?: string;
  role?: string | null;
  user?: any;
  message?: string;
  employeeno?: string;
  department?: string;
  [key: string]: any;
} | null;

type AuthContextType = {
  authData: AuthData;
  setAuthData: (d: AuthData) => void;
  loading: boolean;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  authData: null,
  setAuthData: () => {},
  loading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authData, setAuthData] = useState<AuthData>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate ครั้งแรกจาก cookie
  useEffect(() => {
    try {
      // ✅ ลองอ่าน auth_payload cookie ก่อน (มีข้อมูลครบถ้วนแบบ Menu-react)
      const payloadStr = getCookie("auth_payload");
      if (payloadStr) {
        try {
          const payload = JSON.parse(payloadStr);
          console.log("✅ AuthContext hydrated from auth_payload cookie:", payload);
          setAuthData(payload as any);
          setLoading(false);
          return;
        } catch (e) {
          console.warn("⚠️ auth_payload parse failed:", e);
        }
      }

      // Fallback: อ่านทีละชิ้น (เผื่อคุกกี้ payload เสีย)
      const token = getCookie("auth_token") || getCookie("authToken") || "";
      if (token) {
        const empNo = getCookie("auth_employeeno") || getCookie("employeeno") || getCookie("auth_empno") || "";
        const commonname = getCookie("auth_commonname") || "";
        
        setAuthData({
          token,
          commonname: commonname || undefined,
          employeeno: empNo || undefined,
          message: "hydrated_fallback",
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = async () => {
    try {
      // เคลียร์ทุกอย่างฝั่ง client
      clearAllOnLogout();
      setAuthData(null);
      
      // กลับหน้า signin
      window.location.assign("/master/signin");
    } catch (e) {
      console.warn("Logout failed:", e);
      clearAllOnLogout();
      setAuthData(null);
      window.location.assign("/master/signin");
    }
  };

  const value = useMemo(() => ({ authData, setAuthData, loading, logout }), [authData, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
