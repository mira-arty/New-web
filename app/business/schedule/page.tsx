"use client";

import { useState } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { mn } from "date-fns/locale";
import ScheduleGrid from "@/components/business/schedule/ScheduleGrid";
import StaffAvailabilitySidebar from "@/components/business/schedule/StaffAvailabilitySidebar";
import SlotModal from "@/components/business/schedule/SlotModal";
import BookingDrawer from "@/components/business/schedule/BookingDrawer";
import { StaffSchedule, TimeSlot } from "@/lib/types/schedule";

const WEEKDAYS_MN = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{
    staffId: string;
    staffName: string;
    date: Date;
    slot: TimeSlot;
  } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<{
    staffId: string;
    staffName: string;
    date: Date;
    booking: any;
  } | null>(null);
  const [showAvailabilitySidebar, setShowAvailabilitySidebar] = useState(true);

  // Mock data - replace with real API calls
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleSlotClick = (staffId: string, staffName: string, date: Date, slot: TimeSlot) => {
    if (slot.status === "confirmed" && slot.booking) {
      setSelectedBooking({
        staffId,
        staffName,
        date,
        booking: slot.booking,
      });
    } else {
      setSelectedSlot({
        staffId,
        staffName,
        date,
        slot,
      });
    }
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const days = direction === "prev" ? -7 : 7;
    setCurrentDate(addDays(currentDate, days));
  };

  const navigateDay = (direction: "prev" | "next") => {
    const days = direction === "prev" ? -1 : 1;
    setCurrentDate(addDays(currentDate, days));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-full mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Цагийн хуваарь</h1>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("day")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "day"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Өдөр
                </button>
                <button
                  onClick={() => setViewMode("week")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "week"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Долоо хоног
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => viewMode === "week" ? navigateWeek("prev") : navigateDay("prev")}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-medium min-w-[200px] text-center">
                  {viewMode === "week"
                    ? `${format(weekStart, "MMM d", { locale: mn })} - ${format(addDays(weekStart, 6), "MMM d, yyyy", { locale: mn })}`
                    : format(currentDate, "EEEE, MMMM d, yyyy", { locale: mn })}
                </span>
                <button
                  onClick={() => viewMode === "week" ? navigateWeek("next") : navigateDay("next")}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <button
                onClick={() => setShowAvailabilitySidebar(!showAvailabilitySidebar)}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Тохиргоо
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span>Баталгаажсан</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span>Боломжтой</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-400" />
              <span>Завсарлага</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span>Амралт/Хаалттай</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-300" />
              <span>Хаалттай</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        <div className={`flex-1 overflow-auto ${showAvailabilitySidebar ? "mr-80" : ""}`}>
          {viewMode === "week" ? (
            <div className="p-4">
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-semibold">
                      {format(day, "EEEE", { locale: mn })}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(day, "MMM d", { locale: mn })}
                    </span>
                    {isSameDay(day, new Date()) && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Өнөөдөр
                      </span>
                    )}
                  </div>
                  <ScheduleGrid
                    date={day}
                    onSlotClick={(staffId, staffName, slot) =>
                      handleSlotClick(staffId, staffName, day, slot)
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4">
              <ScheduleGrid
                date={currentDate}
                onSlotClick={(staffId, staffName, slot) =>
                  handleSlotClick(staffId, staffName, currentDate, slot)
                }
              />
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        {showAvailabilitySidebar && (
          <StaffAvailabilitySidebar />
        )}
      </div>

      {/* Modals */}
      {selectedSlot && (
        <SlotModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
        />
      )}

      {selectedBooking && (
        <BookingDrawer
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
