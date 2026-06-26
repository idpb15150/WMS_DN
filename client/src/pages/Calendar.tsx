
import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import PageMeta from "../components/common/PageMeta";
import dayjs from "dayjs";
import "dayjs/locale/th";
import utc from "dayjs/plugin/utc";
import { Drawer, Descriptions, Tag, Tooltip } from "antd";

// (ถ้าใช้ global stylesheet, import css นี้ที่ index.tsx แทนก็ได้)
import "../../../client/src/pages/calendar.css";

dayjs.extend(utc);
dayjs.locale("th");

// ===== Types =====
interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string; // status (scheduled | in_progress)
    raw?: AppointmentRow; // original row for details
  };
}

type AppointmentRow = {
  appointment_id: string;
  branch_id: string;
  bay_id: string;
  mechanic_id: string;
  user_id: string;
  vehicle_id: string;
  start_time: string;   // ISO หรือ 'YYYY-MM-DD HH:mm:ss'
  end_time: string;
  status: string;       // scheduled | in_progress | other
  notes: string;
  total_price: string;
  created_at: string;
  updated_at: string;
};

// const API_ENDPOINT = "http://localhost:3301/api/v1/appointments/appointments";

// สีและสไตล์สำหรับสถานะ
const STATUS_META: Record<
  string,
  { tagColor: string; bgClass: string; borderClass: string; textClass: string; label: string }
> = {
  scheduled: {
    tagColor: "blue",
    bgClass: "bg-gradient-to-r from-[#E6F4FF] to-[#F0F7FF]",
    borderClass: "border-[#1677FF33]",
    textClass: "text-[#165DFF]",
    label: "Scheduled",
  },
  in_progress: {
    tagColor: "gold",
    bgClass: "bg-gradient-to-r from-[#FFF7E6] to-[#FFF9ED]",
    borderClass: "border-[#FAAD1433]",
    textClass: "text-[#D48806]",
    label: "In Progress",
  },
};

// ===== Helpers =====
const isSameDay = (a: dayjs.Dayjs, b: dayjs.Dayjs) => a.startOf("day").isSame(b.startOf("day"));
const toISO = (v: string) => (dayjs(v).isValid() ? dayjs(v).toISOString() : v);
const toDate = (v: string) => (dayjs(v).isValid() ? dayjs(v) : dayjs(v)); // รองรับ ISO และ 'YYYY-MM-DD HH:mm:ss'
const makeExclusiveEnd = (endDate: dayjs.Dayjs) => endDate.add(1, "day");  // สำหรับ allDay multi-day

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);

  // Drawer state
  const [open, setOpen] = useState<boolean>(false);
  const [detail, setDetail] = useState<AppointmentRow | null>(null);

  // ===== Load appointments & map to calendar events =====
  // useEffect(() => {
  //   const loadAppointments = async () => {
  //     try {
  //       const resp = await fetch(API_ENDPOINT, { method: "GET" });
  //       if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  //       const data: AppointmentRow[] = await resp.json();

  //       // Filter only scheduled & in_progress
  //       const filtered = (Array.isArray(data) ? data : []).filter((x) =>
  //         ["scheduled", "in_progress"].includes((x.status ?? "").toLowerCase())
  //       );

  //       // Map to FullCalendar events
  //       const mapped: CalendarEvent[] = filtered.map((a) => {
  //         const s = toDate(a.start_time);
  //         const e = toDate(a.end_time);

  //         const multiDay = !isSameDay(s, e);
  //         // ✅ กฎแสดงผล:
  //         // - single-day => allDay: false (มีเวลา) -> อยู่วันเดียว ไม่ล้น
  //         // - multi-day   => allDay: true, end = exclusive -> พาดหลายวันพอดี
  //         const allDay = multiDay ? true : false;

  //         const startISO = toISO(a.start_time);
  //         const endISO = allDay ? makeExclusiveEnd(e).toISOString() : toISO(a.end_time);

  //         const tLabel = STATUS_META[(a.status ?? "").toLowerCase()]?.label ?? a.status;
  //         const title = `${tLabel} • Bay ${a.bay_id}`;

  //         return {
  //           id: a.appointment_id,
  //           title,
  //           start: startISO,
  //           end: endISO,
  //           allDay,
  //           extendedProps: {
  //             calendar: (a.status ?? "").toLowerCase(),
  //             raw: a,
  //           },
  //         };
  //       });

  //       setEvents(mapped);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  //   loadAppointments();
  // }, []);

  // ===== Click to open details =====
  const handleEventClick = (clickInfo: EventClickArg) => {
    const row = (clickInfo.event.extendedProps as any)?.raw as AppointmentRow | undefined;
    if (!row) return;
    setDetail(row);
    setOpen(true);
  };

  // (optional) select date — คง behavior เดิมไว้ถ้าคุณอยากใช้ในอนาคต
  const handleDateSelect = (_selectInfo: DateSelectArg) => {
    // viewer mode: ไม่เปิด modal สร้าง
  };

  // ===== Custom event render with beautiful colors & NO overflow =====
  const renderEventContent = (eventInfo: any) => {
    const status: string = String(eventInfo.event.extendedProps.calendar ?? "").toLowerCase();
    const meta = STATUS_META[status] ?? {
      tagColor: "default",
      bgClass: "bg-white",
      borderClass: "border-gray-200",
      textClass: "text-gray-700",
      label: status,
    };
    const timeText = eventInfo.timeText;

    const pill = (
      <div className={`calendar-pill ${meta.bgClass} ${meta.borderClass}`} title={`${eventInfo.event.title}`}>
        {/* เวลาเฉพาะกรณีไม่ใช่ allDay */}
        {!eventInfo.event.allDay && <span className={`pill-time ${meta.textClass}`}>{timeText}</span>}
        {!eventInfo.event.allDay && <span className="pill-dot">•</span>}
        <span className="pill-title">{eventInfo.event.title}</span>
      </div>
    );

    // จัดกลางเฉพาะ month view แต่จำกัด max-width ไม่ให้เกิน cell
    if (eventInfo.view?.type === "dayGridMonth") {
      return (
        <div className="pill-center-wrapper">
          <div className="fc-daygrid-event-dot" />
          {pill}
        </div>
      );
    }

    // มุมมองอื่น (timeGridWeek/Day): จัดแบบปกติ อ่านง่าย
    return (
      <div className="pill-default-wrapper">
        <div className="fc-daygrid-event-dot" />
        {pill}
      </div>
    );
  };

  return (
    <>
      <PageMeta
        title="Calendar"
        description="Appointments calendar (Scheduled & In Progress only)"
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            // (ตัวเลือกเพิ่มเติมถ้าอยากคุมจำนวน event ต่อวัน)
            // dayMaxEvents={true}
            // dayMaxEventRows={true}
          />
        </div>
      </div>

      {/* Drawer แสดงดีเทลเมื่อคลิก */}
      <Drawer
        title="Appointment Details"
        placement="right"
        width={440}
        open={open}
        onClose={() => setOpen(false)}
      >
        {detail ? (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Appointment ID">
              {detail.appointment_id}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={STATUS_META[(detail.status ?? "").toLowerCase()]?.tagColor}>
                {STATUS_META[(detail.status ?? "").toLowerCase()]?.label ?? detail.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Branch">{detail.branch_id ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Bay">{detail.bay_id ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Mechanic">{detail.mechanic_id ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="User">{detail.user_id ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Vehicle">{detail.vehicle_id ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Start">
              {dayjs(detail.start_time).isValid()
                ? dayjs(detail.start_time).format("YYYY-MM-DD HH:mm")
                : detail.start_time}
            </Descriptions.Item>
            <Descriptions.Item label="End">
              {dayjs(detail.end_time).isValid()
                ? dayjs(detail.end_time).format("YYYY-MM-DD HH:mm")
                : detail.end_time}
            </Descriptions.Item>
            <Descriptions.Item label="Total Price">
              {Number(detail.total_price).toLocaleString()} THB
            </Descriptions.Item>
            <Descriptions.Item label="Notes">{detail.notes || "-"}</Descriptions.Item>
            <Descriptions.Item label="Created at">
              {dayjs(detail.created_at).isValid()
                ? dayjs(detail.created_at).format("YYYY-MM-DD HH:mm:ss")
                : detail.created_at}
            </Descriptions.Item>
            <Descriptions.Item label="Updated at">
              {dayjs(detail.updated_at).isValid()
                ? dayjs(detail.updated_at).format("YYYY-MM-DD HH:mm:ss")
                : detail.updated_at}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div className="text-gray-500">No data.</div>
        )}
      </Drawer>
    </>
  );
};

export default Calendar;

