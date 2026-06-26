// services/employee.ts
import { apiHR } from "../api/apiHR";

export async function getEmployeeProfile(value: string) {
  const res = await apiHR.get(
    `/api/Employee/GetEmployeeProfile`,
    { params: { Value: value } } // <-- ใช้ params ปกติ ไม่มี _ เพิ่ม
  );
  return res.data as { success: number; data: any[] };
}