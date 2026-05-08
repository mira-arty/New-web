"use client";

import { useState } from "react";
import { format } from "date-fns";
import { StaffAvailabilityRule, BreakRule, ExceptionRule } from "@/lib/types/schedule";

const WEEKDAYS = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];

// Mock data
const mockRules: StaffAvailabilityRule[] = [
  {
    staffId: "staff1",
    staffName: "Бат",
    workingDays: [true, true, true, true, true, false, false],
    startTime: "09:00",
    endTime: "18:00",
    breaks: [
      { id: "b1", label: "Завсарлага", dayOfWeek: 0, startTime: "12:00", endTime: "13:00" },
    ],
  },
  {
    staffId: "staff2",
    staffName: "Оюун",
    workingDays: [true, true, true, true, true, true, false],
    startTime: "10:00",
    endTime: "19:00",
    breaks: [],
  },
  {
    staffId: "staff3",
    staffName: "Энх",
    workingDays: [true, true, true, true, true, false, false],
    startTime: "09:00",
    endTime: "18:00",
    breaks: [],
  },
];

const mockExceptions: ExceptionRule[] = [
  {
    id: "exc1",
    staffId: "staff1",
    staffName: "Бат",
    startDate: new Date(2024, 0, 15),
    endDate: new Date(2024, 0, 20),
    isFullDay: true,
    reason: "Амралт",
  },
];

export default function StaffAvailabilitySidebar() {
  const [selectedStaff, setSelectedStaff] = useState<string>(mockRules[0]?.staffId || "");
  const [rules, setRules] = useState<StaffAvailabilityRule[]>(mockRules);
  const [exceptions, setExceptions] = useState<ExceptionRule[]>(mockExceptions);
  const [showAddBreak, setShowAddBreak] = useState(false);
  const [showAddException, setShowAddException] = useState(false);

  const currentRule = rules.find((r) => r.staffId === selectedStaff);
  const currentExceptions = exceptions.filter((e) => e.staffId === selectedStaff);

  const updateRule = (staffId: string, updates: Partial<StaffAvailabilityRule>) => {
    setRules((prev) =>
      prev.map((r) => (r.staffId === staffId ? { ...r, ...updates } : r))
    );
  };

  const toggleWorkingDay = (staffId: string, dayIndex: number) => {
    const rule = rules.find((r) => r.staffId === staffId);
    if (!rule) return;

    const newDays = [...rule.workingDays];
    newDays[dayIndex] = !newDays[dayIndex];
    updateRule(staffId, { workingDays: newDays });
  };

  const addBreak = (staffId: string, breakData: Omit<BreakRule, "id">) => {
    const rule = rules.find((r) => r.staffId === staffId);
    if (!rule) return;

    const newBreak: BreakRule = {
      ...breakData,
      id: `break_${Date.now()}`,
    };

    updateRule(staffId, { breaks: [...rule.breaks, newBreak] });
  };

  const removeBreak = (staffId: string, breakId: string) => {
    const rule = rules.find((r) => r.staffId === staffId);
    if (!rule) return;

    updateRule(staffId, {
      breaks: rule.breaks.filter((b) => b.id !== breakId),
    });
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-screen overflow-y-auto fixed right-0 top-0 pt-20">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Ажилчдын тохиргоо</h3>

        {/* Staff Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ажилтан сонгох
          </label>
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {rules.map((rule) => (
              <option key={rule.staffId} value={rule.staffId}>
                {rule.staffName}
              </option>
            ))}
          </select>
        </div>

        {currentRule && (
          <>
            {/* Working Days */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ажлын өдрүүд
              </label>
              <div className="flex gap-2">
                {WEEKDAYS.map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleWorkingDay(currentRule.staffId, index)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      currentRule.workingDays[index]
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Work Hours */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ажлын цаг
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={currentRule.startTime}
                  onChange={(e) =>
                    updateRule(currentRule.staffId, { startTime: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="time"
                  value={currentRule.endTime}
                  onChange={(e) =>
                    updateRule(currentRule.staffId, { endTime: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Recurring Breaks */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Тогтмол завсарлага
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddBreak(!showAddBreak)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {showAddBreak ? "Хаах" : "+ Нэмэх"}
                </button>
              </div>

              {showAddBreak && (
                <AddBreakForm
                  onAdd={(breakData) => {
                    addBreak(currentRule.staffId, breakData);
                    setShowAddBreak(false);
                  }}
                  onCancel={() => setShowAddBreak(false)}
                />
              )}

              <div className="space-y-2">
                {currentRule.breaks.map((breakItem) => (
                  <div
                    key={breakItem.id}
                    className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{breakItem.label}</p>
                      <p className="text-xs text-gray-600">
                        {WEEKDAYS[breakItem.dayOfWeek]} · {breakItem.startTime} - {breakItem.endTime}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBreak(currentRule.staffId, breakItem.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {currentRule.breaks.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Тогтмол завсарлага байхгүй
                  </p>
                )}
              </div>
            </div>

            {/* Exceptions */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Амралт, онцгой нөхцөл
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddException(!showAddException)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {showAddException ? "Хаах" : "+ Нэмэх"}
                </button>
              </div>

              {showAddException && (
                <AddExceptionForm
                  onAdd={(exceptionData) => {
                    const staff = rules.find((r) => r.staffId === selectedStaff);
                    setExceptions((prev) => [
                      ...prev,
                      {
                        ...exceptionData,
                        id: `exc_${Date.now()}`,
                        staffId: selectedStaff,
                        staffName: staff?.staffName || "",
                      },
                    ]);
                    setShowAddException(false);
                  }}
                  onCancel={() => setShowAddException(false)}
                />
              )}

              <div className="space-y-2">
                {currentExceptions.map((exception) => (
                  <div
                    key={exception.id}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{exception.reason}</p>
                      <p className="text-xs text-gray-600">
                        {format(exception.startDate, "yyyy-MM-dd")} -{" "}
                        {format(exception.endDate, "yyyy-MM-dd")}
                        {exception.isFullDay ? " (Бүтэн өдөр)" : ` · ${exception.startTime}-${exception.endTime}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setExceptions((prev) => prev.filter((e) => e.id !== exception.id))
                      }
                      className="text-red-600 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {currentExceptions.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Онцгой нөхцөл байхгүй
                  </p>
                )}
              </div>
            </div>

            <button
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              onClick={async () => {
                // Save all rules
                await fetch("/api/business/schedule/availability", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(currentRule),
                });
                alert("Хадгалагдлаа!");
              }}
            >
              Хадгалах
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function AddBreakForm({
  onAdd,
  onCancel,
}: {
  onAdd: (breakData: Omit<BreakRule, "id">) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState("Завсарлага");
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("13:00");

  return (
    <div className="bg-gray-50 p-3 rounded-lg mb-3 space-y-3">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        placeholder="Нэр"
      />
      <select
        value={dayOfWeek}
        onChange={(e) => setDayOfWeek(Number(e.target.value))}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
      >
        {WEEKDAYS.map((day, index) => (
          <option key={index} value={index}>{day}</option>
        ))}
      </select>
      <div className="flex gap-2">
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-1.5 border border-gray-300 rounded-lg text-sm"
        >
          Цуцлах
        </button>
        <button
          onClick={() => onAdd({ label, dayOfWeek, startTime, endTime })}
          className="flex-1 py-1.5 bg-orange-500 text-white rounded-lg text-sm"
        >
          Нэмэх
        </button>
      </div>
    </div>
  );
}

function AddExceptionForm({
  onAdd,
  onCancel,
}: {
  onAdd: (exceptionData: Omit<ExceptionRule, "id" | "staffId" | "staffName">) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isFullDay, setIsFullDay] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  return (
    <div className="bg-gray-50 p-3 rounded-lg mb-3 space-y-3">
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        placeholder="Шалтгаан (Ж: Амралт, Өвчин...)"
      />
      <div className="flex gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isFullDay}
          onChange={(e) => setIsFullDay(e.target.checked)}
        />
        <span className="text-sm">Бүтэн өдөр</span>
      </label>
      {!isFullDay && (
        <div className="flex gap-2">
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-1.5 border border-gray-300 rounded-lg text-sm"
        >
          Цуцлах
        </button>
        <button
          onClick={() =>
            onAdd({
              startDate: new Date(startDate),
              endDate: new Date(endDate),
              isFullDay,
              startTime: isFullDay ? undefined : startTime,
              endTime: isFullDay ? undefined : endTime,
              reason,
            })
          }
          className="flex-1 py-1.5 bg-red-500 text-white rounded-lg text-sm"
        >
          Нэмэх
        </button>
      </div>
    </div>
  );
}
