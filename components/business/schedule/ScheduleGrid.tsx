"use client";

import { useState, useEffect } from "react";
import { format, setHours, setMinutes, isSameDay } from "date-fns";
import { StaffSchedule, TimeSlot, SlotStatus } from "@/lib/types/schedule";

interface ScheduleGridProps {
  date: Date;
  onSlotClick: (staffId: string, staffName: string, slot: TimeSlot) => void;
}

// Generate 30-minute time slots from 08:00 to 21:00
const START_HOUR = 8;
const END_HOUR = 21;
const SLOT_MINUTES = 30;

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
    slots.push(`${String(hour).padStart(2, "0")}:30`);
  }
  return slots;
}

function parseTime(timeStr: string): { hour: number; minute: number } {
  const [hour, minute] = timeStr.split(":").map(Number);
  return { hour, minute };
}

function addMinutesToTime(timeStr: string, minutes: number): string {
  const { hour, minute } = parseTime(timeStr);
  const totalMinutes = hour * 60 + minute + minutes;
  const newHour = Math.floor(totalMinutes / 60);
  const newMinute = totalMinutes % 60;
  return `${String(newHour).padStart(2, "0")}:${String(newMinute).padStart(2, "0")}`;
}

function isTimeInRange(time: string, start: string, end: string): boolean {
  const t = time.replace(":", "");
  const s = start.replace(":", "");
  const e = end.replace(":", "");
  return t >= s && t < e;
}

function getSlotColor(status: SlotStatus): string {
  switch (status) {
    case "confirmed":
      return "bg-blue-500 text-white hover:bg-blue-600";
    case "available":
      return "bg-green-100 hover:bg-green-200 border-green-200";
    case "break":
      return "bg-orange-400 text-white hover:bg-orange-500";
    case "off":
      return "bg-red-500 text-white";
    case "blocked":
      return "bg-gray-300 text-gray-600";
    default:
      return "bg-gray-100";
  }
}

// Mock data - replace with API calls
function getMockStaffSchedules(date: Date): StaffSchedule[] {
  const timeSlots = generateTimeSlots();
  
  // Mock staff
  const staffList = [
    { id: "staff1", name: "Бат", avatar: null },
    { id: "staff2", name: "Оюун", avatar: null },
    { id: "staff3", name: "Энх", avatar: null },
  ];

  return staffList.map((staff) => {
    const slots: TimeSlot[] = timeSlots.map((time) => {
      const endTime = addMinutesToTime(time, SLOT_MINUTES);
      
      // Mock logic for demo purposes
      let status: SlotStatus = "available";
      let booking = undefined;
      let breakInfo = undefined;

      // Some random bookings
      if (staff.id === "staff1" && (time === "10:00" || time === "10:30")) {
        status = "confirmed";
        booking = {
          id: "book1",
          customerName: "Дорж",
          customerPhone: "99112233",
          serviceName: "Үс шингэлэх",
          notes: null,
          status: "confirmed" as const,
          price: 50000,
          startTime: "10:00",
          endTime: "11:00",
        };
      }

      // Break time
      if (staff.id === "staff2" && (time === "13:00" || time === "13:30")) {
        status = "break";
        breakInfo = {
          id: "break1",
          label: "Завсарлага",
          startTime: "13:00",
          endTime: "14:00",
        };
      }

      // Off for staff3 on weekends
      if (staff.id === "staff3" && (date.getDay() === 0 || date.getDay() === 6)) {
        status = "off";
      }

      return {
        time,
        endTime,
        status,
        booking,
        breakInfo,
      };
    });

    return {
      staffId: staff.id,
      staffName: staff.name,
      staffAvatar: staff.avatar,
      slots,
    };
  });
}

export default function ScheduleGrid({ date, onSlotClick }: ScheduleGridProps) {
  const [schedules, setSchedules] = useState<StaffSchedule[]>([]);
  const timeSlots = generateTimeSlots();

  useEffect(() => {
    // In real app, fetch from API
    const data = getMockStaffSchedules(date);
    
    // Detect conflicts
    const withConflicts = data.map((staff) => {
      const bookings = staff.slots
        .filter((s) => s.status === "confirmed" && s.booking)
        .map((s) => s.booking!);
      
      // Check for overlapping bookings
      const hasConflict = bookings.some((booking, i) =>
        bookings.slice(i + 1).some((other) => {
          const b1Start = parseTime(booking.startTime);
          const b1End = parseTime(booking.endTime);
          const b2Start = parseTime(other.startTime);
          const b2End = parseTime(other.endTime);
          
          const b1StartMins = b1Start.hour * 60 + b1Start.minute;
          const b1EndMins = b1End.hour * 60 + b1End.minute;
          const b2StartMins = b2Start.hour * 60 + b2Start.minute;
          const b2EndMins = b2End.hour * 60 + b2End.minute;
          
          return b1StartMins < b2EndMins && b1EndMins > b2StartMins;
        })
      );
      
      return { ...staff, hasConflict };
    });
    
    setSchedules(withConflicts);
  }, [date]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header Row - Staff Names */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <div className="w-20 flex-shrink-0 p-3 border-r border-gray-200 font-medium text-sm text-gray-600">
              Цаг
            </div>
            {schedules.map((staff) => (
              <div
                key={staff.staffId}
                className={`flex-1 min-w-[150px] p-3 border-r border-gray-200 last:border-r-0 ${
                  staff.hasConflict ? "bg-red-50" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                    {staff.staffName[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{staff.staffName}</div>
                    {staff.hasConflict && (
                      <div className="text-xs text-red-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Цаг давхцаж байна!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="divide-y divide-gray-100">
            {timeSlots.map((time) => (
              <div key={time} className="flex">
                <div className="w-20 flex-shrink-0 p-2 border-r border-gray-200 text-xs text-gray-500 text-center flex items-center justify-center">
                  {time}
                </div>
                {schedules.map((staff) => {
                  const slot = staff.slots.find((s) => s.time === time);
                  if (!slot) return null;

                  return (
                    <div
                      key={`${staff.staffId}-${time}`}
                      className={`flex-1 min-w-[150px] p-1 border-r border-gray-200 last:border-r-0 cursor-pointer transition-colors ${getSlotColor(slot.status)}`}
                      onClick={() => onSlotClick(staff.staffId, staff.staffName, slot)}
                    >
                      <div className="h-10 flex items-center justify-center text-xs">
                        {slot.status === "confirmed" && slot.booking ? (
                          <div className="text-center">
                            <div className="font-medium truncate">{slot.booking.customerName}</div>
                            <div className="text-xs opacity-80">{slot.booking.serviceName}</div>
                          </div>
                        ) : slot.status === "break" && slot.breakInfo ? (
                          <span className="font-medium">{slot.breakInfo.label}</span>
                        ) : slot.status === "off" ? (
                          <span className="opacity-75">Амралт</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
