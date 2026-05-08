"use client";

import { useState } from "react";
import { OnboardingState, ServiceInput, DURATION_OPTIONS } from "@/lib/types/onboarding";

interface Step2Props {
  state: OnboardingState;
  updateState: (updates: Partial<OnboardingState>) => void;
}

export default function Step2Services({ state, updateState }: Step2Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addService = () => {
    const newService: ServiceInput = {
      id: `service_${Date.now()}`,
      name: "",
      duration: 60,
      priceMin: 0,
      priceMax: 0,
    };
    updateState({ services: [...state.services, newService] });
  };

  const updateService = (id: string, updates: Partial<ServiceInput>) => {
    updateState({
      services: state.services.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    });
  };

  const removeService = (id: string) => {
    if (state.services.length <= 1) {
      setErrors({ general: "Хамгийн багадаа нэг үйлчилгээ байх ёстой" });
      return;
    }
    updateState({
      services: state.services.filter((s) => s.id !== id),
    });
    setErrors({});
  };

  const validateService = (service: ServiceInput): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!service.name.trim()) {
      newErrors[`name_${service.id}`] = "Нэр оруулна уу";
    }
    if (service.priceMin <= 0) {
      newErrors[`price_${service.id}`] = "Үнэ оруулна уу";
    }
    if (service.priceMax > 0 && service.priceMax < service.priceMin) {
      newErrors[`price_${service.id}`] = "Дээд хязгаар доод хязгаараас бага байж болохгүй";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Үйлчилгээний жагсаалт</h2>
        <span className="text-sm text-gray-500">
          {state.services.length} үйлчилгээ
        </span>
      </div>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errors.general}
        </div>
      )}

      <div className="space-y-4">
        {state.services.map((service, index) => (
          <div
            key={service.id}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">
                Үйлчилгээ #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeService(service.id)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Service Name */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Үйлчилгээний нэр *
                </label>
                <input
                  type="text"
                  value={service.name}
                  onChange={(e) => {
                    updateService(service.id, { name: e.target.value });
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next[`name_${service.id}`];
                      return next;
                    });
                  }}
                  onBlur={() => validateService(service)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors[`name_${service.id}`] ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Жишээ: Үс шингэлэх"
                />
                {errors[`name_${service.id}`] && (
                  <p className="text-sm text-red-600 mt-1">{errors[`name_${service.id}`]}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Үргэлжлэх хугацаа *
                </label>
                <select
                  value={service.duration}
                  onChange={(e) =>
                    updateService(service.id, { duration: Number(e.target.value) as any })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DURATION_OPTIONS.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration} минут
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Үнийн хязгаар (₮) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={service.priceMin || ""}
                    onChange={(e) => {
                      updateService(service.id, { priceMin: Number(e.target.value) });
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next[`price_${service.id}`];
                        return next;
                      });
                    }}
                    onBlur={() => validateService(service)}
                    className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`price_${service.id}`] ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Хамгийн бага"
                    min="0"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    value={service.priceMax || ""}
                    onChange={(e) =>
                      updateService(service.id, { priceMax: Number(e.target.value) })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Хамгийн их"
                    min="0"
                  />
                </div>
                {errors[`price_${service.id}`] && (
                  <p className="text-sm text-red-600 mt-1">{errors[`price_${service.id}`]}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addService}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Үйлчилгээ нэмэх
      </button>
    </div>
  );
}
