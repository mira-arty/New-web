"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BookingState, STEPS } from "@/lib/types/booking";
import Step1ServiceStaff from "./components/Step1ServiceStaff";
import Step2DateTime from "./components/Step2DateTime";
import Step3ConfirmPay from "./components/Step3ConfirmPay";

const STORAGE_KEY = "booking_flow_state";

interface BookingPageProps {
  params: {
    businessId: string;
  };
}

export default function BookingPage({ params }: BookingPageProps) {
  const router = useRouter();
  const [state, setState] = useState<BookingState>({
    step: 1,
    businessId: params.businessId,
    businessName: "",
    businessSlug: "",
    selectedService: null,
    selectedStaff: null,
    selectedDate: null,
    selectedTime: null,
    customerNotes: "",
    paymentMethod: "venue",
  });
  const [businessData, setBusinessData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load persisted state
  useEffect(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_${params.businessId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState((prev) => ({ ...prev, ...parsed }));
      } catch {
        console.error("Failed to load booking state");
      }
    }
  }, [params.businessId]);

  // Persist state
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_${params.businessId}`, JSON.stringify(state));
  }, [state, params.businessId]);

  // Fetch business data
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await fetch(`/api/businesses/${params.businessId}`);
        if (!res.ok) throw new Error("Failed to load business");
        const data = await res.json();
        setBusinessData(data);
        setState((prev) => ({
          ...prev,
          businessName: data.name,
          businessSlug: data.slug,
        }));
      } catch (error) {
        console.error("Error loading business:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [params.businessId]);

  const updateState = useCallback((updates: Partial<BookingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleNext = () => {
    setState((prev) => ({ ...prev, step: Math.min(prev.step + 1, 3) }));
  };

  const handleBack = () => {
    setState((prev) => ({ ...prev, step: Math.max(prev.step - 1, 1) }));
  };

  const handleConfirm = async () => {
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: state.businessId,
          serviceId: state.selectedService?.id,
          staffId: state.selectedStaff?.id,
          date: state.selectedDate,
          time: state.selectedTime,
          notes: state.customerNotes,
          paymentMethod: state.paymentMethod,
        }),
      });

      if (!res.ok) throw new Error("Booking failed");

      const data = await res.json();
      
      // Clear persisted state
      localStorage.removeItem(`${STORAGE_KEY}_${params.businessId}`);
      
      // Redirect to success page
      router.push(`/booking/success/${data.bookingId}`);
    } catch (error) {
      alert("Цаг авахад алдаа гарлаа. Дахин оролдоно уу.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Ачаалж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              disabled={state.step === 1}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold">Цаг авах</h1>
            <div className="w-9" />{/* Spacer */}
          </div>

          {/* Step Indicator */}
          <div className="relative">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: `${((state.step - 1) / (STEPS.length - 1)) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
              />
            </div>
            <div className="flex justify-between">
              {STEPS.map((step) => (
                <div
                  key={step.number}
                  className={`flex flex-col items-center ${
                    step.number <= state.step ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
                      step.number < state.step
                        ? "bg-blue-600 text-white"
                        : step.number === state.step
                        ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step.number < state.step ? (
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

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {state.step === 1 && (
          <Step1ServiceStaff
            businessId={params.businessId}
            selectedService={state.selectedService}
            selectedStaff={state.selectedStaff}
            onServiceSelect={(service) => updateState({ selectedService: service })}
            onStaffSelect={(staff) => updateState({ selectedStaff: staff })}
            onNext={handleNext}
          />
        )}

        {state.step === 2 && (
          <Step2DateTime
            businessId={params.businessId}
            serviceId={state.selectedService?.id || ""}
            staffId={state.selectedStaff?.id || null}
            duration={state.selectedService?.duration || 60}
            selectedDate={state.selectedDate}
            selectedTime={state.selectedTime}
            onDateSelect={(date) => updateState({ selectedDate: date, selectedTime: null })}
            onTimeSelect={(time) => updateState({ selectedTime: time })}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {state.step === 3 && (
          <Step3ConfirmPay
            state={state}
            businessData={businessData}
            onNotesChange={(notes) => updateState({ customerNotes: notes })}
            onPaymentMethodChange={(method) => updateState({ paymentMethod: method })}
            onBack={handleBack}
            onConfirm={handleConfirm}
          />
        )}
      </div>
    </div>
  );
}
