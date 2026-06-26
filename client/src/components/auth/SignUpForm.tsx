
import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";

// ===== การตั้งค่า API ตามที่คุณระบุ =====
const API_BASE_URL = "http://10.1.65.65:3301"; // เปลี่ยนเป็น "http://localhost:3301" เมื่อต้องการทดสอบบนเครื่องตัวเอง
const API_ENDPOINT = `${API_BASE_URL}/api/v1/user/users`;
const API_KEY = "w9Ufg3LJ7IPG0WQme21nv3tQ";

type SignUpResponse = {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
  is_active: number;
  created_at: string;
  updated_at: string;
};

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(true);

  // ฟิลด์ฟอร์ม
  const [username, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // สถานะการเรียก API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<SignUpResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(null);

    // ตรวจสอบข้อมูลขั้นต่ำตามแบบฟอร์ม
    if (!firstName || !lastName || !email || !password || !username) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    if (!isChecked) {
      setError("กรุณายอมรับเงื่อนไข Terms & Privacy ก่อนสมัคร");
      return;
    }

    // จัด payload ตามที่คุณระบุตอนแรกเท่านั้น
    const payload = {
      username: username,                   // เลือกใช้อีเมลเป็น username (ปรับได้ภายหลังถ้าต้องเปลี่ยน)
      email: email,
      password_hash: password,           // ส่งตรงตามที่คุณกำหนด (ไม่ทำการแฮชฝั่ง client)
      full_name: `${firstName} ${lastName}`,
      role: "user",                      // ค่ามาตรฐาน สามารถเปลี่ยนได้ตามระบบ
      is_active: 1                       // ตรงกับตัวอย่างตอบกลับของคุณที่ใช้ 1/0
    };

    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "x-api-key": API_KEY
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        // แสดงรายละเอียด error ให้ชัดเจน
        const text = await res.text();
        throw new Error(`API Error (${res.status}): ${text || res.statusText}`);
      }

      const json: SignUpResponse = await res.json();
      setSuccess(json);

      // หมายเหตุ: ไม่เปลี่ยนแปลงโครงสร้าง Route และไม่ navigate โดยอัตโนมัติ
    } catch (err: any) {
      setError(err?.message ?? "เกิดข้อผิดพลาดระหว่างสมัครสมาชิก");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center text-sm text-gray-500 my-3">••••••••••••••••••••••••</div>

      <h2 className="text-2xl font-semibold mb-2">Sign Up</h2>
      <p className="text-sm text-gray-600 mb-6">Enter your email and password to sign up!</p>


      <div className="text-center text-sm text-gray-500 my-3">••••••••••••••••••••••••</div>

      <form onSubmit={handleSubmit} className="space-y-4">

         {/* username */}
        <div>
          <Label htmlFor="username">Username*</Label>
          <Input
            id="username"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)}
            placeholder="Example"
            required
          />
        </div>



        {/* First Name */}
        <div>
          <Label htmlFor="firstName">First Name*</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
            placeholder="John"
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <Label htmlFor="lastName">Last Name*</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
            placeholder="Doe"
            required
          />
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email*</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="john.doe@example.com"
            required
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Label htmlFor="password">Password*</Label>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeCloseIcon /> : <EyeIcon />}
          </span>
        </div>

        {/* Terms & Privacy */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="accept"
            checked={isChecked}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsChecked(e.target.checked)}
          />
          <label htmlFor="accept" className="text-sm text-gray-700">
            By creating an account means you agree to the{" "}
            <Link to="/terms" className="underline">Terms and Conditions</Link>, and our{" "}
            <Link to="/privacy" className="underline">Privacy Policy</Link>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="p-3 rounded bg-green-50 text-green-700 text-sm break-all">
            <div className="font-medium mb-1">successfully</div>
            {/* <pre className="text-xs">{JSON.stringify(success, null, 2)}</pre> */}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? "กำลังสมัคร..." : "Sign Up"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link to="/signin" className="underline">Sign In</Link>
      </div>
    </div>
  );
}
