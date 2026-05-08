"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { OnboardingState, WEEKDAYS } from "@/lib/types/onboarding";
import Step1BusinessBasics from "@/components/business/onboarding/Step1BusinessBasics";
import Step2Services from "@/components/business/onboarding/Step2Services";
import Step3Staff from "@/components/business/onboarding/Step3Staff";
import Step4BusinessHours from "@/components/business/onboarding/Step4BusinessHours";

const STORAGE_KEY = "business_onboarding_draft";

const initialState: OnboardingState = {
  businessName: "",
  category: "other",
  address: "",
  location: null,
  phone: "",
  profilePhoto: null,
  description: "",
  services: [],
  staff: [],
  businessHours: WEEKDAYS.map((d) => ({
    day: d.day,
    dayName: d.name,
    isOpen: d.day < 5,
    openTime: "09:00",
    closeTime: "18:00",
  })),
  advanceBookingLimit: "1_week",
  bufferTime: 15,
  cancellationPolicy: "",
  currentStep: 1,
  isDraft: false,
};

const STEPS = [
  { number: 1, title: "Бизнесийн мэдээлэл", description: "Үндсэн мэдээлэл" },
  { number: 2, title: "Үйлчилгээ", description: "Үйлчилгээний жагсаалт" },
  { number: 3, title: "Ажилчид", description: "Ажилчидын мэдээлэл" },
  { number: 4, title: "Цагийн хуваарь", description: "Ажиллах цаг" },
];

export default function BusinessOnboardingPage() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState("");

  // Load draft from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState((prev) => ({ ...prev, ...parsed, currentStep: 1 }));
      } catch {
        console.error("Failed to load draft");
      }
    }
  }, []);

  // Auto-save draft when state changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, currentStep: 1 }));
    }, 2000);
    return () => clearTimeout(timeout);
  }, [state]);

  const updateState = useCallback((updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const validateStep = (step: number): boolean => {
    setError("");
    switch (step) {
      case 1:
        if (!state.businessName.trim()) {
          setError("Бизнесийн нэр оруулна уу");
          return false;
        }
        if (!state.address.trim()) {
          setError("Хаяг оруулна уу");
          return false;
        }
        if (!state.location) {
          setError("Газрын зураг дээр байршлаа сонгоно уу");
          return false;
        }
        if (!state.phone.trim()) {
          setError("Утасны дугаар оруулна уу");
          return false;
        }
        return true;
      case 2:
        if (state.services.length === 0) {
          setError("Хамгийн багадаа нэг үйлчилгээ нэмнэ үү");
          return false;
        }
        for (const service of state.services) {
          if (!service.name.trim()) {
            setError("Үйлчилгээний нэр оруулна уу");
            return false;
          }
          if (service.priceMin <= 0) {
            setError("Үнийн доод хязгаар оруулна уу");
            return false;
          }
        }
        return true;
      case 3:
        if (state.staff.length === 0) {
          setError("Хамгийн багадаа нэг ажилтан нэмнэ үү");
          return false;
        }
        for (const member of state.staff) {
          if (!member.name.trim()) {
            setError("Ажилтаны нэр оруулна уу");
            return false;
          }
        }
        return true;
      case 4:
        const hasOpenDay = state.businessHours.some((h) => h.isOpen);
        if (!hasOpenDay) {
          setError("Хамгийн багадаа нэг өдөр нээнэ үү");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(state.currentStep)) {
      setState((prev) => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, 4) }));
    }
  };

  const handleBack = () => {
    setState((prev) => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 1) }));
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, isDraft: true }));
      
      // Also save to server
      await fetch("/api/business/onboarding/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...state, isDraft: true }),
      });
      
      setError("");
      alert("Ноорог хадгалагдлаа!");
    } catch {
      setError("Ноорог хадгалахад алдаа гарлаа");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/business/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Хадгалахад алдаа гарлаа");
      }

      // Clear draft
      localStorage.removeItem(STORAGE_KEY);
      
      // Redirect to dashboard
      router.push("/business/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((state.currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Progress */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Бизнес бүртгүүлэх</h1>
              <p className="text-sm text-gray-500 mt-1">
                {STEPS[state.currentStep - 1].description}
              </p>
            </div>
            <button
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              {isSavingDraft ? "Хадгалж байна..." : "Ноорог хадгалах"}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: `${progress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
              />
            </div>
            <div className="flex justify-between">
              {STEPS.map((step) => (
                <div
                  key={step.number}
                  className={`flex flex-col items-center ${
                    step.number <= state.currentStep ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
                      step.number < state.currentStep
                        ? "bg-blue-600 text-white"
                        : step.number === state.currentStep
                        ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step.number < state.currentStep ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {state.currentStep === 1 && (
            <Step1BusinessBasics state={state} updateState={updateState} />
          )}
          {state.currentStep === 2 && (
            <Step2Services state={state} updateState={updateState} />
          )}
          {state.currentStep === 3 && (
            <Step3Staff state={state} updateState={updateState} />
          )}
          {state.currentStep === 4 && (
            <Step4BusinessHours state={state} updateState={updateState} />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={state.currentStep === 1 || isSubmitting}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Буцах
          </button>

          {state.currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Үргэлжлүүлэх
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Хадгалж байна..." : "Дуусгах"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
