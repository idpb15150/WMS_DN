import React, { useEffect, useMemo, useState, useContext, useCallback } from "react";

import { API_CONFIG } from "../config/apiConfig";
const { HR } = API_CONFIG;
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
} from "antd";
import { CopyOutlined, ReloadOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { AuthContext } from "./AuthPages/AuthContext";
import { getCookie } from "../utils/cookieManager";

const { Title, Text } = Typography;

/** =========================================================
 * Utilities
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
  employeeno?: string;
};

function getAuthPayloadFromCookie(): AuthPayload | null {
  const raw = getCookie("auth_payload");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthPayload;
  } catch {
    return null;
  }
}

function getAuthEmployeeNoFromCookie(): string | null {
  return (
    getCookie("auth_employeeno") ||
    getCookie("auth_empno") ||
    getCookie("employeeno") ||
    getAuthPayloadFromCookie()?.employeeno ||
    null
  );
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
    if (status >= 500) return serverMsg ?? `เซิร์ฟเวอร์ขัดข้อง (${status})`;
    return serverMsg ?? `ข้อผิดพลาดจากปลายทาง (${status})`;
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
  } catch { }
  return String(v);
}

export default function UserProfiles() {
  const { authData } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hrValue, setHrValue] = useState("");
  const [payload, setPayload] = useState<any>(null);
  const [query, setQuery] = useState("");

  const fetchProfile = useCallback(async (value: string) => {
    setLoading(true);
    setError("");

    const token = getAuthPayloadFromCookie()?.token ?? "";

    try {
      const headers: Record<string, string> = {
        accept: "*/*",
      };
      if (token && isAscii(token) && looksLikeJwt(token)) {
        headers["Authorization"] = "Bearer " + token;
      }

      fetch(HR.PROFILE(value), {
        method: "GET",
        headers: {
          "X-API-KEY": HR.KEY,
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          setPayload(data); // ใช้ state เดิมของคุณ
        })
        .catch((err) => {
          setError(err.message);
        });

    } catch (err) {
      setError(explainAxiosError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cookieEmpNo = getAuthEmployeeNoFromCookie();
    const commonname = authData?.commonname || getAuthPayloadFromCookie()?.commonname || "";
    const value = cookieEmpNo || (commonname ?? "").replace(/[^A-Za-z0-9]/g, "");

    setHrValue(value);
    if (value) {
      fetchProfile(value);
    }
  }, [authData?.commonname, authData?.token, fetchProfile]);

  const flattened = useMemo(() => {
    const dataNode = payload?.data ?? payload ?? {};
    const target = Array.isArray(dataNode) ? dataNode[0] ?? {} : dataNode;
    return flattenObject(target);
  }, [payload]);

  const importantFields = useMemo(() => {
    const important: Record<string, any> = {};
    const keyList = [
      "employeeno", "employee_no", "emp_no", "empno", "EMP_NO", "EmployeeNo",
      "department", "dept", "DEPARTMENT", "Dept",
      "first_name", "firstName", "firstname", "FIRST_NAME",
      "last_name", "lastName", "lastname", "LAST_NAME",
      "full_name", "fullName", "FullName", "FULL_NAME",
      "email", "email_address", "EmailAddress", "EMAIL",
      "position", "job_title", "jobtitle", "JobTitle",
      "status", "active",
    ];

    for (const key of keyList) {
      if (key in flattened) {
        const label = key.replace(/_/g, " ").toUpperCase();
        important[label] = flattened[key];
      }
    }
    return important;
  }, [flattened]);

  const otherFields = useMemo(() => {
    const important = Object.keys(importantFields);
    const others: Record<string, any> = {};
    for (const [k, v] of Object.entries(flattened)) {
      if (!important.includes(k)) {
        others[k] = v;
      }
    }
    return others;
  }, [flattened, importantFields]);

  const onCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success("Copied");
  };

  return (
    <div style={{ padding: 24 }}>
      <Card bordered styles={{ body: { padding: 24 } }} style={{ borderRadius: 16 }}>
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space align="center" size={16}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16, background: "#f0f5ff",
                  color: "#1d4ed8", display: "grid", placeItems: "center", fontSize: 28,
                  boxShadow: "0 4px 12px rgba(29, 78, 216, 0.1)"
                }}>
                  <UserOutlined />
                </div>
                <div>
                  <Title level={3} style={{ margin: 0 }}>User Profile</Title>
                  <Text type="secondary">Employee No: {hrValue || "-"}</Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Space>
                <Input
                  allowClear
                  prefix={<SearchOutlined />}
                  placeholder="Search fields..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{ width: 250, borderRadius: 8 }}
                />
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => hrValue && fetchProfile(hrValue)}
                  shape="circle"
                />
              </Space>
            </Col>
          </Row>

          {error && <Alert type="error" message={error} showIcon style={{ borderRadius: 8 }} />}

          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}><Spin size="large" /></div>
          ) : !payload ? (
            <Empty description="No profile data found" />
          ) : (
            <Row gutter={[24, 24]}>
              {Object.entries(importantFields).map(([key, value]) => (
                <Col xs={24} sm={12} lg={8} key={key}>
                  <Card size="small" style={{ borderRadius: 12, background: "#f8fafc" }}>
                    <Space direction="vertical" size={4} style={{ width: "100%" }}>
                      <Row justify="space-between">
                        <Text type="secondary" style={{ fontSize: 11 }}>{key}</Text>
                        <CopyOutlined
                          style={{ fontSize: 12, cursor: "pointer", color: "#94a3b8" }}
                          onClick={() => onCopy(toText(value))}
                        />
                      </Row>
                      <Text strong>{toText(value) || "-"}</Text>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Space>
      </Card>
    </div>
  );
}
