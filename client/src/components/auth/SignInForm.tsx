
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../../pages/AuthPages/AuthContext";
import { getCookie } from "../../utils/cookieManager";
import Button from "../ui/button/Button";

const INTRANET_LOGIN_URL = "https://web942.liteon.com/intranet/";

export default function SignInForm() {
  const navigate = useNavigate();
  const { authData, setAuthData, loading } = useContext(AuthContext);
  const [checking, setChecking] = useState(false);

  // 1. ถ้ามีข้อมูลใน Context อยู่แล้ว ให้ไปหน้าแรก
  useEffect(() => {
    if (!loading && (authData?.token || authData?.user)) {
      navigate("/");
    }
  }, [authData, loading, navigate]);

  // 2. ตั้ง Interval เช็กคุกกี้ทุก 1 วินาที (Auto-login)
  useEffect(() => {
    const interval = setInterval(() => {
      if (authData?.token || authData?.user) return;

      const payloadStr = getCookie("auth_payload");
      if (payloadStr) {
        try {
          const payload = JSON.parse(payloadStr);
          if (payload && (payload.token || payload.user)) {
            console.log("✅ Auto-login: Detected auth_payload cookie");
            setAuthData(payload as any);
            navigate("/");
          }
        } catch (e) {
          console.warn("Failed to parse auth_payload cookie:", e);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [authData, setAuthData, navigate]);

  const handleGoToIntranet = () => {
    setChecking(true);
    window.location.assign(INTRANET_LOGIN_URL);
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto" />
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
          <div className="mb-8 text-center">
            <h1 className="mb-2 font-bold text-gray-800 text-2xl dark:text-white/90">
              Export Liteon
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please login via Intranet to continue
            </p>
          </div>

          <div className="space-y-6">
            <Button 
              className="w-full py-3 text-lg font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]" 
              size="sm" 
              onClick={handleGoToIntranet}
              disabled={checking}
            >
              {checking ? "Redirecting..." : "Login via Intranet"}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Waiting for login session...</span>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              หลังจากเข้าสู่ระบบที่หน้า Intranet แล้ว ระบบจะพาคุณกลับมาโดยอัตโนมัติ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
