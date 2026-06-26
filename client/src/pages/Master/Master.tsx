
import React from "react";
import { Typography, Card, Alert } from "antd";

const { Title, Paragraph, Text } = Typography;

const GuidePage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#eef2ff,#f8fafc)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Card
        style={{
          maxWidth: 800,
          width: "100%",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <Title level={2}>🚀 IIS Deployment Guide</Title>

        <Alert
          message="คำแนะนำสำคัญ"
          description="หากโปรเจคสามารถรันได้บนเครื่อง (Local) แต่ไม่สามารถใช้งานได้เมื่อ Deploy ขึ้น Server IIS"
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Paragraph style={{ fontSize: 16 }}>
          ✅ วิธีแก้ปัญหา:
        </Paragraph>

        <Paragraph style={{ fontSize: 16 }}>
          1. กด <Text keyboard>Ctrl + Shift + F</Text>
        </Paragraph>

        <Paragraph style={{ fontSize: 16 }}>
          2. ค้นหาคำว่า <Text code>Master</Text>
        </Paragraph>

        <Paragraph style={{ fontSize: 16 }}>
          3. แก้ไข path ของ Master ให้ตรงกับ path ที่ใช้งานจริงบน Server IIS
        </Paragraph>

        <Paragraph style={{ fontSize: 16 }}>
          🔧 เนื่องจาก Master component ถูกใช้เป็นโครงสร้างหลักของระบบ จึงจำเป็นต้องกำหนด path ให้ถูกต้องตาม environment ที่ deploy
        </Paragraph>

        <Paragraph style={{ fontSize: 16, marginTop: 20 }}>
          ✅ การตั้งค่า Sidebar และ API
        </Paragraph>


        <Paragraph style={{ fontSize: 16 }}>
          - <Text strong>appsidebar</Text> ใช้ดึงข้อมูล menu จาก API
        </Paragraph>


        <Paragraph style={{ fontSize: 16 }}>
          - <Text strong>appsidebar2</Text> ใช้ตอนพัฒนา (DEV) โดยไม่เรียก API
        </Paragraph>


        <Paragraph style={{ fontSize: 16 }}>
          ✅ การตั้งค่า API Config
        </Paragraph>


        <Alert
          type="info"
          showIcon
          message="Mode DEV"
          description={
            <Text code>
              export const BASE_DOMAIN = window.location.origin;
            </Text>
          }
          style={{ marginBottom: 10 }}
        />


        <Alert
          type="success"
          showIcon
          message="Mode PRODUCTION (IIS)"
          description={
            <Text code>
              export const BASE_DOMAIN = "https://api941.liteon.com";
            </Text>
          }
        />


        <Paragraph style={{ fontSize: 16, marginTop: 10 }}>
          🔁 ให้สลับค่าตาม environment ที่ใช้งาน (DEV / SERVER)
        </Paragraph>
      </Card>
    </div>
  );
};

export default GuidePage;
