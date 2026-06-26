import React from 'react';
import { Space, Input, Button, Table, Typography } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import PageMeta from './PageMeta';

const { Title, Text } = Typography;

interface BaseMonitorProps<T> {
  title: string;
  pageMetaTitle: string;
  searchPlaceholder: string;
  search: string;
  onSearchChange: (value: string) => void;
  addPath?: string;
  updatePath?: string;
  loading: boolean;
  error: string | null;
  dataSource: T[];
  columns: any[];
  rowKey: string | ((record: T) => string);
}

export function BaseMonitor<T>({
  title,
  pageMetaTitle,
  searchPlaceholder,
  search,
  onSearchChange,
  addPath,
  updatePath,
  loading,
  error,
  dataSource,
  columns,
  rowKey,
}: BaseMonitorProps<T>) {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 16 }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* ===== HEADER BAR ===== */}
        <Space style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }}>
          <Title level={4} style={{ margin: 0 }}>
            {title}
          </Title>

          <PageMeta title={pageMetaTitle} description={title} />

          <Space wrap>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{ width: 420 }}
            />

            {addPath && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(addPath)}>
                Add
              </Button>
            )}

            {updatePath && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(updatePath)}>
                Update
              </Button>
            )}
          </Space>
        </Space>

        {/* ===== ERROR ===== */}
        {error && <Text type="danger">Error: {error}</Text>}

        {/* ===== TABLE ===== */}
        <Table<T>
          size="middle"
          rowKey={rowKey}
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          bordered
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50, 100],
            showTotal: (total) => `ทั้งหมด ${total} รายการ`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </Space>
    </div>
  );
}
