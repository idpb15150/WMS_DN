// import { useEffect, useState } from "react";
// import { ArrowUpIcon } from "../../icons";
// import Badge from "../ui/badge/Badge";

// export default function EcommerceMetrics() {
//   const [unitDifference, setUnitDifference] = useState<string | null>(null);
//   const [monthlyDifference, setMonthlyDifference] = useState<string | null>(null);

//   // Fetch and calculate daily unit difference
//   useEffect(() => {
//     async function fetchDailyData() {
//       try {
//         const response = await fetch("http://192.168.23.32:1880/powermeter3");
//         const data = await response.json();
//         console.log("Raw Data:", data);

//         const dataByDate: Record<string, number[]> = {};

//         // Group data by 'day' field
//         data.forEach((entry: { day: string; Unit: string }) => {
//           const date = entry.day;
//           if (!dataByDate[date]) {
//             dataByDate[date] = [];
//           }
//           dataByDate[date].push(parseFloat(entry.Unit));
//         });

//         console.log("Data By Date:", dataByDate);

//         const today = new Date();

//         // ฟังก์ชันแปลงวันที่เป็นรูปแบบ "DD-MM-YYYY"
//         const formatDate = (date: Date) => {
//           const day = ("0" + date.getDate()).slice(-2);
//           const month = ("0" + (date.getMonth() + 1)).slice(-2);
//           const year = date.getFullYear();
//           return `${day}-${month}-${year}`;
//         };

//         const todayStr = formatDate(today);
//         console.log("Today's Date:", todayStr);

//         // ตรวจสอบว่ามีข้อมูลของวันนั้นหรือไม่
//         if (dataByDate[todayStr]?.length > 0) {
//           // กรองข้อมูลที่ไม่ใช่ตัวเลขออก
//           const validData = dataByDate[todayStr].filter((unit) => !isNaN(unit));

//           if (validData.length > 1) {
//             const minValue = Math.min(...validData);
//             const maxValue = Math.max(...validData);
//             const difference = maxValue - minValue;

//             console.log(`Difference for ${todayStr}:`, difference);
//             setUnitDifference(difference.toFixed(2));
//           } else {
//             setUnitDifference("N/A");
//           }
//         } else {
//           setUnitDifference("N/A");
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setUnitDifference("Error");
//       }
//     }

//     fetchDailyData();
//   }, []); // useEffect for daily data

//   useEffect(() => {
//     async function fetchMonthlyData() {
//       try {
//         const response = await fetch("http://192.168.23.32:1880/powermeter3");
//         const data = await response.json();
          
//         const currentDate = new Date();
//         const currentMonth = currentDate.getMonth() + 1; // เดือนปัจจุบัน (1-12)
//         const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1; // เดือนก่อนหน้านี้ (12 สำหรับมกราคม)
  
//         let currentUnit = null;
//         let previousUnit = null;
  
//         data.forEach((entry: { day: string; Unit: string }) => {
//           // แยก day, month, year จากรูปแบบ "DD-MM-YYYY"
//           const [day, month, year] = entry.day.split("-").map(Number);
          
//           // ตรวจสอบว่าเดือนและปีตรงกับเดือนปัจจุบันหรือเดือนก่อนหน้านี้
//           if (month === previousMonth && year === currentDate.getFullYear()) previousUnit = parseFloat(entry.Unit);
//           if (month === currentMonth && year === currentDate.getFullYear()) currentUnit = parseFloat(entry.Unit);
//         });
  
//         if (currentUnit !== null && previousUnit !== null) {
//           const difference = currentUnit - previousUnit;
//           console.log("Monthly Difference:", difference);
//           setMonthlyDifference(difference.toFixed(2));
//         } else {
//           setMonthlyDifference("N/A");
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setMonthlyDifference("Error");
//       }
//     }
  
//     fetchMonthlyData();
//   }, []);

//   return (
//     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
//       {/* Power Consumption Metric */}
//       <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
//         <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
//           <span className="text-3xl text-gray-800 dark:text-white/90">⚡</span>
//         </div>

//         <div className="flex items-end justify-between mt-5">
//           <div>
//             <span className="text-sm text-gray-500 dark:text-gray-400">
//               Power Consumption (kWh)
//             </span>
//             <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
//               {unitDifference !== null ? unitDifference : "Loading..."}
//             </h4>
//           </div>
//         </div>
//       </div>

//       {/* Monthly Consumption Metric */}
//       <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
//         <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
//           <span className="text-3xl text-gray-800 dark:text-white/90">📅</span>
//         </div>

//         <div className="flex items-end justify-between mt-5">
//           <div>
//             <span className="text-sm text-gray-500 dark:text-gray-400">
//               Monthly Consumption (kWh)
//             </span>
//             <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
//               {monthlyDifference !== null ? monthlyDifference : "Loading..."}
//             </h4>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";

export default function EcommerceMetrics() {
  const [dailyUsage, setDailyUsage] = useState<string | null>(null);
  const [dailyCharge, setDailyCharge] = useState<string | null>(null);
  const [monthlyUsage, setMonthlyUsage] = useState<string | null>(null);
  const [monthlyCharge, setMonthlyCharge] = useState<string | null>(null);

  useEffect(() => {
    async function fetchElectricityData() {
      try {
        const response = await fetch("http://192.168.21.6:1880/api/daily/electricity/all");
        const data = await response.json();
        console.log("Raw Data:", data);

        // ดึงข้อมูลจาก JSON ที่ให้มา
        const dailyData = data.Day[0] || {};
        const monthData = data.Month[0] || {};

        setDailyUsage(dailyData.Daily_electricity_usage || "N/A");
        setDailyCharge(dailyData.Daily_electricity_charge || "N/A");

        setMonthlyUsage(monthData.Month_electricity_usage || "N/A");
        setMonthlyCharge(monthData.Month_electricity_charge || "N/A");
      } catch (error) {
        console.error("Error fetching data:", error);
        setDailyUsage("Error");
        setDailyCharge("Error");
        setMonthlyUsage("Error");
        setMonthlyCharge("Error");
      }
    }

    // เรียกใช้งานครั้งแรก
    fetchElectricityData();

    // ตั้ง interval ให้รีเฟรชทุกๆ 5 วินาที
    const interval = setInterval(fetchElectricityData, 5000);

    // Cleanup function: ลบ interval เมื่อ component ถูก unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* 🔋 Daily Power Consumption */}
      <Card icon="⚡" title="Daily Consumption (kWh)" value={dailyUsage} />

      {/* 💰 Daily Electricity Charge */}
      <Card icon="💸" title="Daily Electricity Charge (Baht)" value={dailyCharge} />

      {/* 📆 Monthly Power Consumption */}
      <Card icon="📅" title="Monthly Consumption (kWh)" value={monthlyUsage} />

      {/* 💵 Monthly Electricity Charge */}
      <Card icon="🏦" title="Monthly Electricity Charge (Baht)" value={monthlyCharge} />
    </div>
  );
}

// 🔹 Card Component
function Card({ icon, title, value }: { icon: string; title: string; value: string | null }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        <span className="text-3xl text-gray-800 dark:text-white/90">{icon}</span>
      </div>
      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {value !== null ? value : "Loading..."}
          </h4>
        </div>
      </div>
    </div>
  );
}
