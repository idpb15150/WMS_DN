
/** 
 * 🛠️ เลือกโหมดการเชื่อมต่อ API (เปิดใช้บรรทัดที่ต้องการเพียงบรรทัดเดียว)
 */

// export const BASE_DOMAIN = "https://api941.liteon.com";
export const BASE_DOMAIN = window.location.origin;



export const API_KEY = "d9613ca5-6fc2-4253-8cc2-9575f3cae24a";
export const API_BASE_URL = `${BASE_DOMAIN}/APIAuthentication/api/Authentication/login`;

export const API_CONFIG = {
  // Authentication
  AUTH: {
    KEY: "d9613ca5-6fc2-4253-8cc2-9575f3cae24a",
    LOGIN: `${BASE_DOMAIN}/APIAuthentication/api/Authentication/login`,
  },

  // HR Profile
  HR: {
    KEY: "019bbbda-f3b6-768c-abbc-cada74d21886",
    PROFILE: (value: string) =>
      `${BASE_DOMAIN}/APIHumanResources/api/Employee/GetEmployeeProfile?Value=${encodeURIComponent(value)}`,
  },

  // Menu System
  MENU: {
    KEY: "019b303f-4c4d-785c-a738-22864f7751c0",
    BY_USER: (empNo: string, status: string = "Active") =>
      `${BASE_DOMAIN}/APIMenu/api/UserRole/GetAllMenuByUser?empNo=${encodeURIComponent(empNo)}&maiN_CODE=DOApp&suB_CODE=INBApp&status=${encodeURIComponent(status)}`,
  },



  MENU2: {
    KEY: "019b303f-4c4d-785c-a738-22864f7751c0",
    BY_USER: (
      empNo: string,
      mainCode: string = "DOApp",
      subCode: string = "INBApp",
      status: string = "Active"
    ) =>
      `${BASE_DOMAIN}/APIMenu/api/UserRole/GetAllMenuByUser` +
      `?empNo=${encodeURIComponent(empNo)}` +
      `&mainCode=${encodeURIComponent(mainCode)}` +
      `&subCode=${encodeURIComponent(subCode)}` +
      `&status=${encodeURIComponent(status)}`,
  },



  // Import System
  IMPORT: {
    KEY: "019cc2c5-d46e-7a20-9813-a7abe6f6a88a",
  },

  // Base URL
  BASE: BASE_DOMAIN,
};