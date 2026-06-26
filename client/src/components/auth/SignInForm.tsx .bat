
import axios from 'axios';
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router"; // ใช้ react-router เท่านั้น
import { AuthContext } from '../../pages/AuthPages/AuthContext';
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

// ฟังก์ชันช่วยสำหรับ decode JWT แบบไม่ต้องพึ่งแพ็กเกจ
function safeDecodeJWT(token: string): { [k: string]: any } | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");       // ใช้เป็น userName ที่ API ต้องการ
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { authData, setAuthData } = useContext(AuthContext);
  const [navigated, setNavigated] = useState(false);

  useEffect(() => {
    if (!loading && authData?.token && !navigated) {
      setNavigated(true);
      navigate("/");
    }
  }, [authData, loading, navigate, navigated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // เรียก API ตามที่ระบุ พร้อม X-API-KEY และ Content-Type
      const response = await axios.post(
        'https://api941/APIAuthentication/api/Authentication/login',
        {
          userName: email,      // ← แมปจากช่อง Email เป็น userName
          password: password,   // ← password ตามที่ผู้ใช้กรอก
        },
        {
          headers: {
            'accept': '*/*',
            'X-API-KEY': 'd9613ca5-6fc2-4253-8cc2-9575f3cae24a',
            'Content-Type': 'application/json',
          },
          withCredentials: false, // JWT ใน header/body ไม่ต้องใช้คุกกี้
        }
      );

      // รูปแบบผลลัพธ์จาก API:
      // {
      //   "success": 1,
      //   "data": { "message": "Authenticated", "commonname": "Phuttakan P.", "token": "<JWT>" }
      // }
      const api = response.data as {
        success?: number;
        data?: { message?: string; commonname?: string; token?: string };
      };

      if (api?.success === 1 && api?.data?.token) {
        const token = api.data.token;
        const cn = api.data.commonname ?? email;

        // พยายามอ่าน role/claims จาก JWT (ถ้ามี)
        const claims = safeDecodeJWT(token);
        // ตัวอย่างคีย์ที่มักพบใน payload:
        // - name / unique_name
        // - role (หรือ roles)
        // - cn (commonname)
        const role =
          (claims?.role as string) ??
          (Array.isArray(claims?.roles) ? claims?.roles?.[0] : undefined) ??
          undefined;

        // เก็บลง Context ให้หน้าอื่นใช้งานต่อ
        setAuthData({
          message: api.data.message ?? "Authenticated",
          commonname: cn,
          token: token,
          role: role,
        });

        // ตั้งอายุคุกกี้ตาม "Keep me logged in": 7 วันหรือ 1 ชั่วโมง
        const maxAge = isChecked ? 60 * 60 * 24 * 7 : 60 * 60;
        document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}`;

        navigate("/");
      } else {
        setError(api?.data?.message ?? "Login failed");
      }
    } catch (err: any) {
      if (err.response) {
        setError(`Server error (${err.response.status}): ${err.response.data?.message ?? err.message}`);
      } else if (err.request) {
        setError("Cannot reach server (network/CORS)");
      } else {
        setError(err.message ?? "Error connecting to server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto" />
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              LOGIN
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your username and password to login!
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="space-y-6">
              <div>
                <Label>Email <span className="text-error-500">*</span></Label>
                <Input
                  placeholder="PhuttakanP" // ตัวอย่าง userName ที่ API ต้องการ
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label>Password <span className="text-error-500">*</span></Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="@Gtavc1515088"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox checked={isChecked} onChange={setIsChecked} />
                  <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                    Keep me logged in
                  </span>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {loading && <p className="text-blue-500 text-sm">Loading...</p>}

              <div>
                <Button className="w-full" size="sm" type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-5" />
        </div>
      </div>
    </div>
  );
}

