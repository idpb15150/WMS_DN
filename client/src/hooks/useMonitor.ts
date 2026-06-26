import { useState, useEffect, useMemo } from 'react';
import { message } from 'antd';
import { AxiosInstance } from 'axios';

interface UseMonitorOptions<T> {
  api: AxiosInstance;
  apiPath: string;
  searchFields: (keyof T)[];
  onSuccess?: (data: T[]) => void;
}

export function useMonitor<T>(options: UseMonitorOptions<T>) {
  const { api, apiPath, searchFields, onSuccess } = options;
  const [data, setData] = useState<T[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(apiPath);
      if (res.data?.success === 1) {
        const fetchedData = res.data.data;
        setData(fetchedData);
        if (onSuccess) onSuccess(fetchedData);
      } else {
        const msg = res.data?.message || 'Load failed';
        setError(msg);
        message.error(msg);
      }
    } catch (e: any) {
      const msg = e.message || 'Cannot connect to API';
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return data;
    return data.filter((item) =>
      searchFields.some((field) => {
        const val = item[field];
        return val && String(val).toLowerCase().includes(s);
      })
    );
  }, [search, data, searchFields]);

  return {
    data,
    filteredData,
    search,
    setSearch,
    loading,
    error,
    fetchData,
  };
}
