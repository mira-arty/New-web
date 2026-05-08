"use client";

import { DayAvailability } from "@/lib/types/business-profile";
import { format, addDays } from "date-fns";
import { mn } from "date-fns/locale";

interface AvailabilitySectionProps {
  availability: DayAvailability[];
  onDaySelect: (date: Date) => void;
}

export default function AvailabilitySection({ availability, onDaySelect }: AvailabilitySectionProps) {
  if (availability.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 py-6">
      <h2 className="text-xl font-semibold mb-4">Боломжтой цаг</h2>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {availability.map((day) => {
          const isToday = format(day.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
          
          return (
            <button
              key={day.date.toISOString()}
              onClick={() => onDaySelect(day.date)}
              className={`flex-shrink-0 p-3 rounded-xl text-center min-w-[80px] transition-colors ${
                isToday
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 hover:border-blue-300"
              }`}
            >
              <p className={`text-xs ${isToday ? "text-blue-100" : "text-gray-500"}`}>
                {format(day.date, "EEE", { locale: mn })}
              </p>
              <p className={`text-lg font-bold mt-0.5 ${isToday ? "text-white" : "text-gray-900"}`}>
                {format(day.date, "d")}
              </p>
              <p className={`text-xs mt-0.5 ${isToday ? "text-blue-100" : "text-green-600"}`}>
                {day.availableSlots} цаг
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
