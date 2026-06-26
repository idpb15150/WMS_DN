import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

const API_KEY_FIXED = "d9613ca5-6fc2-4253-8cc2-9575f3cae24a";
const API_KEY_PROFILE = "019bbbda-f3b6-768c-abbc-cada74d21886";
const API_KEY_MENU = "019b303f-4c4d-785c-a738-22864f7751c0";
const API_KEY_IMPORT = "019cc2c5-d46e-7a20-9813-a7abe6f6a88a";

export default defineConfig({
  base: "/master/",
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
    {
      name: "redirect-to-base",
      configureServer(server) {
        // 💡 เติมประเภท (Type) ให้กับ req และ res ตรงนี้เพื่อแก้เอเรอร์
        server.middlewares.use((req, res, next) => {
          // ใช้ Type Assertion หรือระบุให้ชัดเจน เพื่อเลี่ยงตัวแปรหลุดเซต
          const currentUrl = (req as any).url || "";

          if (
            !currentUrl.startsWith("/master/") &&
            !currentUrl.startsWith("/@") &&
            !currentUrl.startsWith("/API") &&
            !currentUrl.includes(".")
          ) {
            res.writeHead(301, { Location: "/master" + currentUrl });
            res.end();
          } else {
            next();
          }
        });
      },
    },
  ],
  server: {
    host: true,
    port: 5173,
    // 💡 สลับปิดเป็น false เนื่องจากให้โปรแกรมข้ามไปครอบ HTTPS ผ่าน Nginx ตัวแอปหลักแทน
    https: false, 
    proxy: {
      "/APIAuthentication": {
        target: "https://api941.liteon.com",
        changeOrigin: true,
        secure: false,
        headers: {
          "X-API-KEY": API_KEY_FIXED,
          "X-Api-Key": API_KEY_FIXED,
          "X-APIKEY": API_KEY_FIXED,
          "X-Liteon-Api-Key": API_KEY_FIXED,
        },
      },
      "/APIHumanResources": {
        target: "https://api941.liteon.com",
        changeOrigin: true,
        secure: false,
        headers: {
          "X-API-KEY": API_KEY_PROFILE,
          "X-Api-Key": API_KEY_PROFILE,
          "X-APIKEY": API_KEY_PROFILE,
          "X-Liteon-Api-Key": API_KEY_PROFILE,
        },
      },
      "/APIMenu": {
        target: "https://api941.liteon.com",
        changeOrigin: true,
        secure: false,
        headers: {
          "X-API-KEY": API_KEY_MENU,
          "X-Api-Key": API_KEY_MENU,
          "X-APIKEY": API_KEY_MENU,
          "X-Liteon-Api-Key": API_KEY_MENU,
        },
      },
      "/APIImport": {
        target: "https://api941.liteon.com",
        changeOrigin: true,
        secure: false,
        headers: {
          "X-API-KEY": API_KEY_IMPORT,
          "X-Api-Key": API_KEY_IMPORT,
          "X-APIKEY": API_KEY_IMPORT,
          "X-Liteon-Api-Key": API_KEY_IMPORT,
        },
      },
    },
  },
  preview: {
    // 💡 สำหรับโหมดพรีวิว ปิดค่าเพื่อให้ทำ Routing ไปหาพอร์ตของ Nginx อย่างถูกต้อง
    https: false,
  },
});