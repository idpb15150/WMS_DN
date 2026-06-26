// src/hooks/useMenus.ts
import { useEffect, useMemo, useState } from 'react';
import { fetchMenusByEmpNo, Main } from '../api/menuService';

type UseMenusOptions = {
  apiKey: string;
  empNo?: string;          // ถ้าไม่ส่ง จะอ่านจาก localStorage: 'auth_empno'
  auto?: boolean;          // default true: ดึงทันทีเมื่อ mount
};

export function useMenus(options: UseMenusOptions) {
  const { apiKey, empNo, auto = true } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string>('');
  const [menus, setMenus]   = useState<Main[]>([]);

  const effectiveEmpNo = useMemo(() => {
    return (empNo ?? localStorage.getItem('auth_empno') ?? '').trim();
  }, [empNo]);

  async function load() {
    if (!effectiveEmpNo) {
      setError('Employee No. (empNo) is empty');
      setMenus([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const main = await fetchMenusByEmpNo(effectiveEmpNo, apiKey);
      setMenus(main ?? []);
    } catch (e: any) {
      const status = e?.response?.status as number | undefined;
      const payload = e?.response?.data;
      const payloadMsg =
        payload?.message ?? payload?.error ?? payload?.Message ??
        (typeof payload === 'string' ? payload : undefined);
      const base = payloadMsg ?? e.message ?? 'โหลดเมนูไม่สำเร็จ';
      setError(status ? `${base} (HTTP ${status})` : base);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (auto) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveEmpNo, apiKey]);

  return { loading, error, menus, reload: load, empNo: effectiveEmpNo };
}
