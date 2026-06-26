// utils/loginErrors.ts
import axios, { AxiosError } from "axios";

// ช่วย normalize ข้อความ
function norm(s?: string) {
  return (s || "").trim().toLowerCase();
}

// แปล error จากฝั่ง response 200 (เช่น message ไม่ใช่ success หรือ token ว่าง)
export function explainLogicalFailure(result: any) {
  const msg = norm(result?.message);
  if (!result) return "ระบบไม่ส่งข้อมูลกลับมา (ผลลัพธ์ว่าง)";

  if (!result?.token) {
    if (/password/i.test(result?.message)) return "รหัสผ่านไม่ถูกต้อง";
    if (/user not found|invalid user|unknown user/i.test(result?.message)) return "ไม่พบบัญชีผู้ใช้";
    if (/locked|disable|inactive/i.test(result?.message)) return "บัญชีถูกระงับการใช้งาน";
    if (/expired|timeout/i.test(result?.message)) return "เซสชันหมดอายุ โปรดลองเข้าสู่ระบบใหม่อีกครั้ง";
    if (/role|permission|authorize|forbid/i.test(result?.message)) return "สิทธิ์การเข้าถึงไม่เพียงพอ";

    // ไม่มี token และ message ไม่สื่อความ → บอกสรุปพร้อมบอกว่ารับ 200 แต่ไม่ผ่านกติกา
    return "เข้าสู่ระบบไม่สำเร็จ (ไม่มี token ในผลลัพธ์)";
  }

  // มี token แต่เงื่อนไขตรวจ message เข้มเกินไป
  if (result?.token && msg && !/success|ok|pass/i.test(msg)) {
    return `เซิร์ฟเวอร์ตอบกลับ: "${result.message}" (แต่ผ่าน token แล้ว)`;
  }

  // กรณีทั่วไป (fallback)
  return result?.message || "เข้าสู่ระบบไม่สำเร็จ";
}

// แปล error จาก axios (4xx/5xx/เน็ตเวิร์ก/CORS/SSL ฯลฯ)
export function explainAxiosError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return (error as any)?.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
  }

  const err = error as AxiosError<any>;
  const status = err.response?.status;
  const serverMsg: string | undefined =
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.response?.data?.Message;

  if (status) {
    // กลุ่ม 401/403/404/429/5xx → ให้ข้อความจำเพาะ
    if (status === 400) return serverMsg || "คำขอไม่ถูกต้อง (400)";
    if (status === 401) return serverMsg || "ยังไม่ได้เข้าสู่ระบบ หรือ token ไม่ถูกต้อง (401)";
    if (status === 403) return serverMsg || "ไม่ได้รับอนุญาตให้เข้าถึงทรัพยากรนี้ (403)";
    if (status === 404) return serverMsg || "ปลายทางไม่ถูกต้อง หรือ API ไม่มีอยู่ (404)";
    if (status === 429) return serverMsg || "เรียกใช้งานบ่อยเกินไป กรุณาลองใหม่ (429)";
    if (status >= 500) return serverMsg || `เซิร์ฟเวอร์ขัดข้อง (${status})`;
    return serverMsg || `เกิดข้อผิดพลาดจากฝั่งเซิร์ฟเวอร์/ปลายทาง (${status})`;
  }

  // ไม่มี response → อาจเป็นเน็ตเวิร์ก/SSL/CORS/HMR
  if (err.code === "ERR_NETWORK") {
    // ลองไกด์เหตุผลยอดฮิต
    if (/certificate|ssl|https|handshake/i.test(err.message)) {
      return "เชื่อมต่อแบบ HTTPS ไม่สำเร็จ (ใบรับรอง/SSL มีปัญหา)";
    }
    if (/cors/i.test(err.message)) {
      return "ถูกบล็อกโดย CORS — ต้องเปิดอนุญาต origin และ credentials";
    }
    return "เชื่อมต่อเครือข่ายไม่ได้ หรือปลายทางไม่ตอบสนอง";
  }

  // Fallback ที่อ่านง่าย
  return serverMsg || err.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
}