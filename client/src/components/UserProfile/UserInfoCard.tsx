import React, { useEffect, useMemo, useState, useContext, useCallback } from "react";
import axios from "axios";
import { apiAuth } from "../../api/apiAuth";
import { apiHR } from "../../api/apiHR";
import {
  Card,
  Typography,
  Row,
  Col,
  Space,
  Input,
  Button,
  Tooltip,
  Alert,
  Spin,
  Empty,
  message,
  Image,
} from "antd";
import { CopyOutlined, ReloadOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { AuthContext } from "../../pages/AuthPages/AuthContext";
const { Title, Text } = Typography;

/** =========================================================
 * Cookie Utilities (Basic, No RegExp)
 * ========================================================= */
type AuthPayload = {
  message: string;
  commonname: string;
  token: string;
  role: string | null;
  user: any;
  hrValue: string;
  issuedAt: string;
  expiresAt: string;
};

// อ่านคุกกี้แบบพื้นฐาน
function readCookie(name: string): string | null {
  const prefix = name + "=";
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const c of cookies) {
    if (c.startsWith(prefix)) {
      const raw = c.slice(prefix.length);
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    }
  }
  return null;
}
function getAuthPayloadFromCookie(): AuthPayload | null {
  const raw = readCookie("auth_payload");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthPayload;
  } catch {
    return null;
  }
}
function isAscii(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code < 0x20 || code > 0x7e) return false;
  }
  return true;
}
function looksLikeJwt(s: string): boolean {
  let dots = 0;
  for (let i = 0; i < s.length; i++) if (s[i] === ".") dots++;
  return dots === 2;
}

/** =========================================================
 * Config
 * ========================================================= */
const HR_API_KEY = import.meta.env.VITE_HR_API_KEY as string;

/** =========================================================
 * Helpers
 * ========================================================= */
function explainAxiosError(error: unknown): string {
  const anyErr = error as any;
  const status: number | undefined = anyErr?.response?.status;
  const serverMsg =
    anyErr?.response?.data?.message ??
    anyErr?.response?.data?.error ??
    anyErr?.response?.data?.Message;

  if (status) {
    if (status === 400) return serverMsg ?? "คำขอไม่ถูกต้อง (400)";
    if (status === 401) return serverMsg ?? "ยังไม่ได้เข้าสู่ระบบ หรือสิทธิ์ไม่ถูกต้อง (401)";
    if (status === 403) return serverMsg ?? "ไม่ได้รับอนุญาตให้เข้าถึงทรัพยากรนี้ (403)";
    if (status === 404) return serverMsg ?? "API ไม่พบปลายทาง (404)";
    if (status === 429) return serverMsg ?? "เรียกใช้งานบ่อยเกินไป (429)";
    if (status >= 500) return serverMsg ?? `เซิร์ฟเวอร์ขัดข้อง (${status})`;
    return serverMsg ?? `ข้อผิดพลาดจากปลายทาง (${status})`;
  }
  if (anyErr?.code === "ERR_NETWORK") {
    const msg = (anyErr?.message ?? "").toString();
    if (/certificate|ssl|https|handshake/i.test(msg)) {
      return "เชื่อมต่อแบบ HTTPS ไม่สำเร็จ (SSL มีปัญหา)";
    }
    if (/cors/i.test(msg)) {
      return "ถูกบล็อกโดย CORS — ตรวจสอบ origin/credentials";
    }
    return "เชื่อมต่อเครือข่ายไม่ได้ หรือปลายทางไม่ตอบสนอง";
  }
  return anyErr?.message ?? "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
}
function flattenObject(obj: any, prefix = ""): Record<string, any> {
  const result: Record<string, any> = {};
  if (obj === null || obj === undefined) return result;
  const isObject = (x: any) => Object.prototype.toString.call(x) === "[object Object]";
  const isArray = Array.isArray;
  const walk = (value: any, keyPath: string) => {
    if (isArray(value)) {
      if (value.length === 0) {
        result[keyPath] = "[]";
        return;
      }
      for (let i = 0; i < value.length; i++) {
        walk(value[i], `${keyPath}[${i}]`);
      }
      return;
    }
    if (isObject(value)) {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        result[keyPath] = "{}";
        return;
      }
      for (const k of keys) {
        const nextKey = keyPath ? `${keyPath}.${k}` : k;
        walk(value[k], nextKey);
      }
      return;
    }
    result[keyPath] = value;
  };
  if (isArray(obj) || isObject(obj)) {
    walk(obj, prefix);
  } else {
    result[prefix || "value"] = obj;
  }
  const cleaned: Record<string, any> = {};
  for (const k of Object.keys(result)) {
    cleaned[k.replace(/^\./, "")] = result[k];
  }
  return cleaned;
}
function toText(v: any): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  try {
    if (typeof v === "object") return JSON.stringify(v);
  } catch {}
  return String(v);
}

/** =========================================================
 * Component
 * ========================================================= */
export default function UserInfoCard() {
  const { authData } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hrValue, setHrValue] = useState("");
  const [payload, setPayload] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fromContext = authData?.commonname ?? "";
    const fromCookie = getAuthPayloadFromCookie()?.commonname ?? "";
    const commonname = fromContext || fromCookie;
    const value = (commonname ?? "").replace(/[^A-Za-z0-9]/g, "");
    setHrValue(value);
    if (value) fetchProfile(value);
  }, [authData?.commonname]);

  const fetchProfile = useCallback(async (value: string) => {
    setLoading(true);
    setError("");

    const token = getAuthPayloadFromCookie()?.token ?? "";

    try {
      const headers: Record<string, string> = {
        accept: "*/*",
        "X-API-KEY": HR_API_KEY,
      };
      if (token && isAscii(token) && looksLikeJwt(token)) {
        headers["Authorization"] = "Bearer " + token;
      }

      // ✅ เรียกผ่าน absolute URL
      const res = await apiHR.get(
        "/api/Employee/GetEmployeeProfile",
        {
          params: { Value: value, _: Date.now() },
          headers,
          withCredentials: false,
          validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
        }
      );

      if (res.status === 304) {
        message.info("Profile not modified (304) — using cached data");
        return;
      }

      setPayload(res.data);

      const d: any = (res.data && res.data.data) ? res.data.data : res.data;
      const first: any = Array.isArray(d) ? (d[0] ?? null) : d;

      const empNoRaw =
        (first &&
          (first.EMP_NO ??
           first.emp_no ??
           first.EmpNo ??
           first.EMPLOYEE_NO ??
           first.employeeNo ??
           first.EmployeeNo)) ??
        null;

      if (empNoRaw != null) {
        const empNo = String(empNoRaw).trim();
        if (empNo) {
          
          window.dispatchEvent(new CustomEvent("empno-updated", { detail: { empNo } }));
        }
      }

      const winPath: string | undefined =
        first && (first.EMP_PICTURE ?? first.emp_picture ?? first.EmpPicture);

      if (winPath && typeof winPath === "string") {
        const parts = winPath.split("\\");
        const fileName = parts.length ? parts[parts.length - 1] : "";
        setPhotoUrl(fileName ? "/HRPhoto/" + fileName : null);
      } else {
        setPhotoUrl(null);
      }
    } catch (err) {
      setError(explainAxiosError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const flattened = useMemo(() => {
    const dataNode = payload?.data ?? payload ?? {};
    return flattenObject(dataNode);
  }, [payload]);

  const filteredEntries = useMemo(() => {
    const q = query.trim().toLowerCase();
    const entries = Object.entries(flattened);
    if (!q) return entries;
    return entries.filter(([k, v]) => {
      const val = toText(v).toLowerCase();
      return k.toLowerCase().includes(q) || val.includes(q);
    });
  }, [flattened, query]);

  const onCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success("Copied");
    } catch {
      message.warning("ไม่สามารถคัดลอกได้");
    }
  }, []);

  return (
    <Card bordered className="profile-card" styles={{ body: { padding: 20 } }}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
          <Space align="center" size={12}>
            {photoUrl ? (
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 6px 16px rgba(0,0,0,.06)",
                }}
                title="Employee photo"
              >
                <Image
                  src={photoUrl}
                  alt="Employee photo"
                  width={64}
                  height={64}
                  style={{ objectFit: "cover" }}
                  preview={false}
                  fallback="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'></svg>"
                />
              </div>
            ) : (
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 12,
                  background: "#f2f6ff",
                  color: "#1677ff",
                  border: "1px solid #e5e7eb",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 24,
                  boxShadow: "0 6px 16px rgba(0,0,0,.06)",
                }}
                title="No photo"
              >
                <UserOutlined />
              </div>
            )}

            <Space direction="vertical" size={0}>
              <Title level={4} style={{ margin: 0 }}>
                Employee Profile
              </Title>
              <Text type="secondary">Value: {hrValue ?? "-"}</Text>
            </Space>
          </Space>

          <Space>
            <Input
              allowClear
              size="middle"
              prefix={<SearchOutlined />}
              placeholder="ค้นหา field หรือค่า…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
            <Tooltip title="Reload">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => hrValue && fetchProfile(hrValue)}
                className="ghost-btn"
              />
            </Tooltip>
          </Space>
        </Space>

        {error && <Alert type="error" message={error} showIcon />}

        {loading ? (
          <div style={{ padding: "16px 0" }}>
            <Spin /> <span style={{ marginLeft: 8 }}>Loading profile…</span>
          </div>
        ) : filteredEntries.length === 0 ? (
          <Empty description="No data" />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {filteredEntries.map(([key, value]) => {
                const stringVal = toText(value);
                return (
                  <Col xs={24} md={12} key={key}>
                    <div className="field-card">
                      <div className="field-head">
                        <Text className="field-label">{key}</Text>
                        <Tooltip title="Copy">
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => onCopy(stringVal)}
                            className="copy-btn"
                          />
                        </Tooltip>
                      </div>
                      <Input value={stringVal} readOnly className="field-input" />
                    </div>
                  </Col>
                );
              })}
            </Row>
          </>
        )}
      </Space>

      <style>{`
        .profile-card { transition: box-shadow .25s ease, transform .12s ease; }
        .profile-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); } 
        .search-input { width: 280px; transition: box-shadow .25s ease, transform .12s ease, border-color .25s ease; }
        .ghost-btn { transition: background-color .25s ease, transform .12s ease; }
        .ghost-btn:hover { background: rgba(0,0,0,.04); transform: translateY(-1px); }
        .field-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 10px 12px; transition: border-color .25s ease, box-shadow .25s ease, transform .12s ease; }
        .field-card:hover { border-color: #1677ff; box-shadow: 0 8px 20px rgba(0,0,0,0.06); transform: translateY(-2px); }
        .field-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .field-label { font-size: 12px; color: #6b7280; letter-spacing: .2px; user-select: text; }
        .field-input { font-weight: 500; transition: box-shadow .25s ease, transform .12s ease, border-color .25s ease; }
        .field-input:hover, .field-input:focus-within { border-color: #1677ff; box-shadow: 0 0 0 4px rgba(22,119,255,.2); }
        .copy-btn { color: #6b7280; transition: color .25s ease, transform .12s ease, background-color .25s ease; border-radius: 8px; }
        .copy-btn:hover { color: #1677ff; background: rgba(22,119,255,.12); transform: translateY(-1px); }
      `}</style>
    </Card>
  );
}