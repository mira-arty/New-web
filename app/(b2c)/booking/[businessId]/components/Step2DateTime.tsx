"use client";

import { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isBefore, startOfDay } from "date-fns";
import { mn } from "date-fns/locale";
import { TimeSlot } from "@/lib/types/booking";

interface Step2Props {
  businessId: string;
  serviceId: string;
  staffId: string | null;
  duration: number;
  selectedDate: string | null;
  selectedTime: string | null;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const WEEKDAYS = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];

export default function Step2DateTime({
  businessId,
  serviceId,
  staffId,
  duration,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  onNext,
  onBack,
}: Step2Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch available slots when date is selected
  useEffect(() => {
    if (!selectedDate) return;

    const fetchSlots = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          businessId,
          serviceId,
          date: selectedDate,
        });
        if (staffId) params.set("staffId", staffId);

        const res = await fetch(`/api/availability?${params}`);
        if (!res.ok) throw new Error("Failed to fetch slots");

        const data = await res.json();
        setTimeSlots(data.slots || []);
      } catch (error) {
        console.error("Error fetching slots:", error);
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, businessId, serviceId, staffId]);

  // Supabase Realtime subscription (simulated - would use actual Supabase client)
  useEffect(() => {
    if (!selectedDate) return;

    // In real implementation, subscribe to Supabase Realtime
    // const subscription = supabase
    //   .channel('bookings')
    //   .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' },
    //     () => { fetchSlots(); }
    //   )
    //   .subscribe();

    // return () => { subscription.unsubscribe(); };
  }, [selectedDate]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const today = startOfDay(new Date());

  return (
    <div className="space-y-6">
      {/* Duration Reminder */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-blue-800">
          Энэ үйлчилгээ <span className="font-semibold">{duration} минут</span> үргэлжилнэ
        </p>
      </div>

      {/* Calendar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy", { locale: mn })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}

          {days.map((day) => {
            const isDisabled = isBefore(day, today);
            const isSelected = selectedDate === format(day, "yyyy-MM-dd");
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={day.toISOString()}
                onClick={() => !isDisabled && onDateSelect(format(day, "yyyy-MM-dd"))}
                disabled={isDisabled}
                className={`
                  py-2 rounded-lg text-sm font-medium transition-colors
                  ${isDisabled ? "text-gray-300 cursor-not-allowed" : ""}
                  ${isSelected ? "bg-blue-600 text-white" : ""}
                  ${!isDisabled && !isSelected && isCurrentMonth ? "hover:bg-gray-100 text-gray-900" : ""}
                  ${!isDisabled && !isSelected && !isCurrentMonth ? "text-gray-400" : ""}
                  ${isToday && !isSelected ? "border-2 border-blue-300" : ""}
                `}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            {format(new Date(selectedDate), "EEEE, MMMM d", { locale: mn })}
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
              <p className="text-gray-500">Цаг шалгаж байна...</p>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Энэ өдөр боломжтой цаг байхгүй</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => slot.isAvailable && onTimeSelect(slot.time)}
                  disabled={!slot.isAvailable}
                  className={`
                    py-2.5 px-3 rounded-lg text-sm font-medium transition-colors
                    ${selectedTime === slot.time
                      ? "bg-blue-600 text-white"
                      : slot.isAvailable
                      ? "bg-white border border-gray-200 hover:border-blue-300 text-gray-900"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }
                  `}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
        >
          Буцах
        </button>
        <button
          onClick={onNext}
          disabled={!selectedDate || !selectedTime}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Үргэлжлүүлэх
        </button>
      </div>
    </div>
  );
}
