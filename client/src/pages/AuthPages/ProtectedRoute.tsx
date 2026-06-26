import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router"; // ตามข้อกำหนดโปรเจกต์ของพี่
import { AuthContext } from "./AuthContext";

type Props = { children: JSX.Element; redirectTo?: string; minDelayMs?: number };

export default function ProtectedRoute({ children, redirectTo = "/signin", minDelayMs = 800 }: Props) {
  const { authData, loading } = useContext(AuthContext); // ต้องมี loading จาก Context
  const [minDelayDone, setMinDelayDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinDelayDone(true), minDelayMs);
    return () => clearTimeout(t);
  }, [minDelayMs]);

  // รอทั้ง "โหลดสถานะ" และ "ดีเลย์กันแวบ"
  if (loading || !minDelayDone) {
    return <>Loading...</>; // ใส่ spinner ของโปรเจกต์แทนได้
  }

  // ไม่มี token -> ส่งกลับไปหน้า signin
  if (!authData?.token && !authData?.user) {
    return <Navigate to={redirectTo} replace />;
  }

  return children; // มี token -> ผ่าน
}
