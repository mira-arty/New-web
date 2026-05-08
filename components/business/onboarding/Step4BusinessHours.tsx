"use client";

import { OnboardingState, WEEKDAYS, ADVANCE_BOOKING_OPTIONS, BUFFER_TIME_OPTIONS } from "@/lib/types/onboarding";

interface Step4Props {
  state: OnboardingState;
  updateState: (updates: Partial<OnboardingState>) => void;
}

export default function Step4BusinessHours({ state, updateState }: Step4Props) {
  const updateBusinessHour = (
    dayIndex: number,
    updates: Partial<{ isOpen: boolean; openTime: string; closeTime: string }>
  ) => {
    const newHours = state.businessHours.map((hour, index) =>
      index === dayIndex ? { ...hour, ...updates } : hour
    );
    updateState({ businessHours: newHours });
  };

  const openAllDays = () => {
    updateState({
      businessHours: state.businessHours.map((h) => ({
        ...h,
        isOpen: true,
        openTime: "09:00",
        closeTime: "18:00",
      })),
    });
  };

  const closeWeekends = () => {
    updateState({
      businessHours: state.businessHours.map((h) =>
        h.day >= 5 ? { ...h, isOpen: false } : h
      ),
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Ажиллах цаг & Тохиргоо</h2>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={openAllDays}
          className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Бүх өдөр нээх
        </button>
        <button
          type="button"
          onClick={closeWeekends}
          className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Амралтын өдөр хаах
        </button>
      </div>

      {/* Weekly Schedule */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">Долоо хоногийн хуваарь</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {state.businessHours.map((hour, index) => (
            <div
              key={hour.day}
              className={`flex items-center gap-4 px-4 py-3 ${
                !hour.isOpen ? "bg-gray-50" : "bg-white"
              }`}
            >
              <label className="flex items-center gap-3 w-32">
                <input
                  type="checkbox"
                  checked={hour.isOpen}
                  onChange={(e) =>
                    updateBusinessHour(index, { isOpen: e.target.checked })
                  }
                  className="rounded"
                />
                <span className={`text-sm font-medium ${hour.isOpen ? "text-gray-900" : "text-gray-500"}`}>
                  {hour.dayName}
                </span>
              </label>

              <div className={`flex items-center gap-2 flex-1 ${!hour.isOpen ? "opacity-50" : ""}`}>
                <input
                  type="time"
                  value={hour.openTime}
                  onChange={(e) =>
                    updateBusinessHour(index, { openTime: e.target.value })
                  }
                  disabled={!hour.isOpen}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="time"
                  value={hour.closeTime}
                  onChange={(e) =>
                    updateBusinessHour(index, { closeTime: e.target.value })
                  }
                  disabled={!hour.isOpen}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {!hour.isOpen && (
                  <span className="text-sm text-gray-500 ml-2">Хаалттай</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Advance Booking Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Урьдчилан цаг авах хугацаа
          </label>
          <select
            value={state.advanceBookingLimit}
            onChange={(e) =>
              updateState({
                advanceBookingLimit: e.target.value as any,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ADVANCE_BOOKING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Үйлчлүүлэгчид энэ хугацаанаас өмнө цаг авах боломжтой
          </p>
        </div>

        {/* Buffer Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Цуцлах завсарлага
          </label>
          <select
            value={state.bufferTime}
            onChange={(e) =>
              updateState({
                bufferTime: Number(e.target.value) as any,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {BUFFER_TIME_OPTIONS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes === 0 ? "Байхгүй" : `${minutes} минут`}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Хоёр цагийн хоорондох завсарлага
          </p>
        </div>
      </div>

      {/* Cancellation Policy */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Цуцлах журам
        </label>
        <textarea
          value={state.cancellationPolicy}
          onChange={(e) => updateState({ cancellationPolicy: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Жишээ: Цагаас 24 цагийн өмнө цуцлавар цагийн төлбөрийг буцаана. 24 цагийн дотор цуцлавар төлбөр буцаагдахгүй."
        />
        <p className="text-xs text-gray-500 mt-1">
          Энэ мэдээллийг үйлчлүүлэгчид цаг авах үед харах болно
        </p>
      </div>

      {/* Summary Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Бүртгэлийн мэдээлэл</h4>
        <div className="space-y-1 text-sm text-blue-800">
          <p>
            <span className="font-medium">Бизнес:</span> {state.businessName || "-"}
          </p>
          <p>
            <span className="font-medium">Үйлчилгээ:</span> {state.services.length} үйлчилгээ
          </p>
          <p>
            <span className="font-medium">Ажилтан:</span> {state.staff.length} ажилтан
          </p>
          <p>
            <span className="font-medium">Нээлттэй өдөр:</span>{" "}
            {state.businessHours.filter((h) => h.isOpen).length} өдөр
          </p>
        </div>
      </div>
    </div>
  );
}
