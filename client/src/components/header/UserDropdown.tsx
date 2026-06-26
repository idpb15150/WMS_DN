import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Dropdown, Typography, Space, Badge, theme, Modal } from "antd";
import type { MenuProps } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  CaretDownOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { getEmployeeProfile } from "../../services/hrEmployee";
import { getCookie } from "../../utils/cookieManager";
import { clearAllOnLogout } from "../../utils/logoutCookies";

type Props = {
  username: string;
  onSignOut?: () => void;
};

type Emp = {
  TITLE_NAME_EN?: string;
  FIRST_NAME_EN?: string;
  LAST_NAME_EN?: string;
  TITLE_NAME_TH?: string;
  FIRST_NAME_TH?: string;
  LAST_NAME_TH?: string;
  ADUSER?: string;
  POSITION_NAME_EN?: string;
  POSITION_NAME_TH?: string;
  PHOTO_URL?: string;
  AVATAR_BASE64?: string;
};

function toDisplayName(emp?: Emp): string {
  if (!emp) return "User";
  const nameEn = [emp.TITLE_NAME_EN, emp.FIRST_NAME_EN, emp.LAST_NAME_EN].filter(Boolean).join(" ").trim();
  const nameTh = [emp.TITLE_NAME_TH, emp.FIRST_NAME_TH, emp.LAST_NAME_TH].filter(Boolean).join("").trim();
  return nameEn || nameTh || emp.ADUSER || "User";
}

function toRole(emp?: Emp): string {
  if (!emp) return "";
  return emp.POSITION_NAME_EN?.trim() || emp.POSITION_NAME_TH?.trim() || "";
}

function toAvatarSrc(emp?: Emp): string | undefined {
  if (!emp) return undefined;
  if (emp.AVATAR_BASE64) return `data:image/png;base64,${emp.AVATAR_BASE64}`;
  if (emp.PHOTO_URL) return emp.PHOTO_URL;
  return undefined;
}

async function runClientLogout(options?: {
  redirectTo?: string;
}): Promise<never> {
  // ใน Export_Liteon ปกติ basename คือ /master/
  const redirectTo = options?.redirectTo ?? "/master/signin";
  try {
    clearAllOnLogout();
    window.location.assign(redirectTo);
    return new Promise(() => { }) as never;
  } catch (e) {
    window.location.assign(redirectTo);
    return new Promise(() => { }) as never;
  }
}

export default function UserDropdown({ username, onSignOut }: Props) {
  const { token } = theme.useToken();
  const [emp, setEmp] = useState<Emp | null>(null);
  const [displayName, setDisplayName] = useState<string>("User");
  const [role, setRole] = useState<string>("");
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);

  const safeUser = useMemo(() => {
    if (username) return username.trim();
    // ดึงจากคุกกี้ต่างๆ ตามแบบ Menu-react
    const fromCookie = getCookie("auth_employeeno") || getCookie("employeeno") || getCookie("auth_empno");
    if (fromCookie) return fromCookie.trim();
    
    const payloadRaw = getCookie("auth_payload");
    if (payloadRaw) {
      try {
        const payload = JSON.parse(payloadRaw);
        return (payload.employeeno || payload.commonname || "").trim();
      } catch {
        return "";
      }
    }
    return "";
  }, [username]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!safeUser) {
        if (!cancelled) {
          setEmp(null);
          setDisplayName("User");
          setRole("");
          setAvatarSrc(undefined);
        }
        return;
      }
      try {
        const body = await getEmployeeProfile(safeUser);
        if (cancelled) return;
        if (body?.success === 1 && Array.isArray(body.data) && body.data.length > 0) {
          const e: Emp = body.data[0] ?? {};
          setEmp(e);
          setDisplayName(toDisplayName(e));
          setRole(toRole(e));
          setAvatarSrc(toAvatarSrc(e));
        } else {
          setEmp(null);
          setDisplayName("User");
          setRole("");
          setAvatarSrc(undefined);
        }
      } catch (err: any) {
        if (cancelled) return;
        setEmp(null);
        setDisplayName("User");
        setRole("");
        setAvatarSrc(undefined);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [safeUser]);

  const gotoProfile = () => {
    window.location.assign("/master/profile");
  };

  const handleSignOut = () => {
    Modal.confirm({
      title: "Sign out",
      icon: <ExclamationCircleFilled />,
      content: "Are you sure you want to sign out?",
      okText: "Sign out",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        if (onSignOut) {
          try {
            await onSignOut();
          } finally {
            await runClientLogout();
          }
        } else {
          await runClientLogout();
        }
      },
    });
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Profile",
      icon: <UserOutlined />,
      onClick: gotoProfile,
    },
    { type: "divider" },
    {
      key: "signout",
      danger: true,
      label: "Sign out",
      icon: <LogoutOutlined />,
      onClick: handleSignOut,
    },
  ];

  return (
    <Dropdown
      trigger={["click"]}
      menu={{ items: menuItems }}
      placement="bottomRight"
    >
      <div
        role="button"
        style={{
          cursor: "pointer",
          padding: "8px 12px",
          borderRadius: 12,
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          transition: "all 0.2s",
        }}
      >
        <Space align="center" size="middle">
          <Badge color="green" dot offset={[-2, 32]}>
            <Avatar
              size={40}
              src={avatarSrc}
              icon={!avatarSrc ? <UserOutlined /> : undefined}
              style={{ background: !avatarSrc ? token.colorPrimary : undefined }}
            />
          </Badge>
          <div style={{ lineHeight: 1.2, textAlign: "left" }}>
            <Typography.Text strong style={{ display: "block", fontSize: 14 }}>
              {displayName}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {role || "Online"}
            </Typography.Text>
          </div>
          <CaretDownOutlined style={{ color: token.colorTextQuaternary, fontSize: 12 }} />
        </Space>
      </div>
    </Dropdown>
  );
}