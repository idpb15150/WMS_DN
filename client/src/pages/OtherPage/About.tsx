
import React from 'react';
import type { FC } from 'react';
import { Card, Typography, Space, Button, Divider } from 'antd';
import { MailOutlined } from '@ant-design/icons';
// ❗️ไม่ใช้ useNavigate เพราะคุณใช้ react-router
// import { useNavigate } from 'react-router';

// ถ้าคุณต้องการใช้ PageMeta / PageBreadcrumb คงไว้ได้
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

const { Title, Text } = Typography;

// ✅ ใส่ลิงก์ Microsoft Teams ของคุณ
const TEAMS_URL = 'https://teams.microsoft.com/l/chat/0/0?users=Jirasin.K@liteon.com';

const Abouts: FC = () => {
  // ❌ ไม่ใช้ useNavigate ตามเงื่อนไขของโปรเจกต์
  // const navigate = useNavigate();

  return (
    <>
      <PageMeta title="Contact | LITEON" />
      <PageBreadcrumb items={[{ title: 'อื่น ๆ' }, { title: 'contact' }]} />

      {/* เรนเดอร์ปุ่มตรง ๆ ด้วย Card ของ AntD */}
      <Card style={{ marginTop: 16 }}>
        <Title level={4}>ติดต่อทีมงาน</Title>
        <Text>
          หากต้องการสอบถามเร่งด่วน กดปุ่มด้านล่างเพื่อคุยกับทีมงานผ่าน <b>Microsoft Teams</b> ได้ทันที หรือติดต่อเบอร์ภายใน 151,105
        </Text>

        <Divider />

        <Space wrap>
          <Button
            type="primary"
            icon={<MailOutlined />}
            href={TEAMS_URL}
            target="_blank"
            rel="noreferrer"
          >
            แชทผ่าน Microsoft Teams
          </Button>
        </Space>
      </Card>
    </>
  );
};

export default Abouts;

