// src/services/hrEmployee.ts
import { apiAuth as apiHR } from "../api/apiAuth";

export interface EmployeeProfileResponse {
  success: number;
  data: any[];
}

export async function getEmployeeProfile(value: string): Promise<EmployeeProfileResponse> {
  const qs = new URLSearchParams();
  qs.set("Value", value);

  const res = await apiHR.get(
    "/APIHumanResources/api/Employee/GetEmployeeProfile",
    {
      params: qs,
      paramsSerializer: params => params.toString(),
    }
  );
  return res.data as EmployeeProfileResponse;
}