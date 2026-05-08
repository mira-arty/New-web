"use client";

import { useState, useRef } from "react";
import { OnboardingState, StaffInput, WEEKDAYS } from "@/lib/types/onboarding";

interface Step3Props {
  state: OnboardingState;
  updateState: (updates: Partial<OnboardingState>) => void;
}

export default function Step3Staff({ state, updateState }: Step3Props) {
  const [uploadingStaffId, setUploadingStaffId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const addStaff = () => {
    const newStaff: StaffInput = {
      id: `staff_${Date.now()}`,
      name: "",
      role: "",
      phone: "",
      avatarUrl: null,
      serviceIds: [],
      workSchedule: WEEKDAYS.map((d) => ({
        day: d.day,
        dayName: d.name,
        isWorking: d.day < 5,
        startTime: "09:00",
        endTime: "18:00",
      })),
    };
    updateState({ staff: [...state.staff, newStaff] });
  };

  const updateStaff = (id: string, updates: Partial<StaffInput>) => {
    updateState({
      staff: state.staff.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    });
  };

  const removeStaff = (id: string) => {
    if (state.staff.length <= 1) {
      alert("Хамгийн багадаа нэг ажилтан байх ёстой");
      return;
    }
    updateState({
      staff: state.staff.filter((s) => s.id !== id),
    });
  };

  const toggleService = (staffId: string, serviceId: string) => {
    const staff = state.staff.find((s) => s.id === staffId);
    if (!staff) return;

    const newServiceIds = staff.serviceIds.includes(serviceId)
      ? staff.serviceIds.filter((id) => id !== serviceId)
      : [...staff.serviceIds, serviceId];

    updateStaff(staffId, { serviceIds: newServiceIds });
  };

  const updateWorkDay = (
    staffId: string,
    dayIndex: number,
    updates: Partial<{ isWorking: boolean; startTime: string; endTime: string }>
  ) => {
    const staff = state.staff.find((s) => s.id === staffId);
    if (!staff) return;

    const newSchedule = staff.workSchedule.map((day, index) =>
      index === dayIndex ? { ...day, ...updates } : day
    );

    updateStaff(staffId, { workSchedule: newSchedule });
  };

  const handlePhotoUpload = async (staffId: string, file: File) => {
    setUploadingStaffId(staffId);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      updateStaff(staffId, { avatarUrl: data.url });
    } catch (error) {
      console.error("Upload error:", error);
      alert("Зураг оруулахад алдаа гарлаа");
    } finally {
      setUploadingStaffId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Ажилчид</h2>
        <span className="text-sm text-gray-500">
          {state.staff.length} ажилтан
        </span>
      </div>

      <div className="space-y-6">
        {state.staff.map((member, index) => (
          <div
            key={member.id}
            className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-gray-500">
                Ажилтан #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeStaff(member.id)}
                className="text-red-600 hover:text-red-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Photo */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden mb-2 ${
                    member.avatarUrl ? "border-blue-300" : "border-gray-300"
                  }`}
                >
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <input
                  ref={(el) => { fileInputRefs.current[member.id] = el; }}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(member.id, file);
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRefs.current[member.id]?.click()}
                  disabled={uploadingStaffId === member.id}
                  className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  {uploadingStaffId === member.id ? "Оруулж байна..." : "Зураг оруулах"}
                </button>
              </div>

              {/* Name, Role, Phone */}
              <div className="sm:col-span-2 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Нэр *
                  </label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateStaff(member.id, { name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Бат Эрдэнэ"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Албан тушаал
                    </label>
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => updateStaff(member.id, { role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Мастер"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Утас
                    </label>
                    <input
                      type="tel"
                      value={member.phone}
                      onChange={(e) => updateStaff(member.id, { phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="9911 2233"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Service Assignments */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Гүйцэтгэх үйлчилгээ
              </label>
              {state.services.length === 0 ? (
                <p className="text-sm text-gray-500">Эхлээд үйлчилгээ нэмнэ үү</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {state.services.map((service) => (
                    <label
                      key={service.id}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        member.serviceIds.includes(service.id)
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={member.serviceIds.includes(service.id)}
                        onChange={() => toggleService(member.id, service.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{service.name || "Нэргүй үйлчилгээ"}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Work Schedule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ажлын цагийн хуваарь
              </label>
              <div className="space-y-2">
                {member.workSchedule.map((day, dayIndex) => (
                  <div
                    key={day.day}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      day.isWorking ? "bg-white border border-gray-200" : "bg-gray-100"
                    }`}
                  >
                    <label className="flex items-center gap-2 w-24">
                      <input
                        type="checkbox"
                        checked={day.isWorking}
                        onChange={(e) =>
                          updateWorkDay(member.id, dayIndex, { isWorking: e.target.checked })
                        }
                        className="rounded"
                      />
                      <span className="text-sm font-medium">{day.dayName}</span>
                    </label>
                    <div className={`flex items-center gap-2 flex-1 ${!day.isWorking ? "opacity-50" : ""}`}>
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) =>
                          updateWorkDay(member.id, dayIndex, { startTime: e.target.value })
                        }
                        disabled={!day.isWorking}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) =>
                          updateWorkDay(member.id, dayIndex, { endTime: e.target.value })
                        }
                        disabled={!day.isWorking}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addStaff}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Ажилтан нэмэх
      </button>
    </div>
  );
}
