"use client";

import { useState } from "react";
import { BookingState, PaymentMethod } from "@/lib/types/booking";
import { format, parseISO } from "date-fns";
import { mn } from "date-fns/locale";

interface Step3Props {
  state: BookingState;
  businessData: any;
  onNotesChange: (notes: string) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onBack: () => void;
  onConfirm: () => void;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string; description: string; icon: string }[] = [
  {
    value: "qpay",
    label: "QPay",
    description: "QPay QR кодоор төлнө",
    icon: "📱",
  },
  {
    value: "socialpay",
    label: "SocialPay",
    description: "SocialPay апп-аар төлнө",
    icon: "💳",
  },
  {
    value: "venue",
    label: "Байран дээр төлөх",
    description: "Үйлчилгээ авах үед төлнө",
    icon: "💵",
  },
];

export default function Step3ConfirmPay({
  state,
  businessData,
  onNotesChange,
  onPaymentMethodChange,
  onBack,
  onConfirm,
}: Step3Props) {
  const [showQPayModal, setShowQPayModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (state.paymentMethod === "qpay") {
      setShowQPayModal(true);
      return;
    }

    if (state.paymentMethod === "socialpay") {
      // Redirect to SocialPay
      window.location.href = `/api/payment/socialpay?bookingData=${encodeURIComponent(JSON.stringify(state))}`;
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Захиалгын мэдээлэл</h3>
        </div>

        <div className="p-4 space-y-4">
          {/* Service */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Үйлчилгээ</p>
              <p className="font-medium">{state.selectedService?.name}</p>
              <p className="text-sm text-gray-500">{state.selectedService?.duration} мин · {state.selectedService?.price.toLocaleString()}₮</p>
            </div>
          </div>

          {/* Staff */}
          {state.selectedStaff && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {state.selectedStaff.avatarUrl ? (
                  <img src={state.selectedStaff.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Ажилтан</p>
                <p className="font-medium">{state.selectedStaff.name}</p>
              </div>
            </div>
          )}

          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Огноо & Цаг</p>
              <p className="font-medium">
                {state.selectedDate && format(parseISO(state.selectedDate), "EEEE, MMMM d", { locale: mn })}
              </p>
              <p className="text-sm text-gray-500">{state.selectedTime}</p>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <span className="font-medium">Нийт</span>
            <span className="text-xl font-bold">{state.selectedService?.price.toLocaleString()}₮</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Нэмэлт тэмдэглэл (заавал биш)
        </label>
        <textarea
          value={state.customerNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Онцгой хүсэлт, харшил гэх мэт..."
        />
      </div>

      {/* Payment Methods */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Төлбөрийн хэлбэр</h3>

        <div className="space-y-2">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.value}
              onClick={() => onPaymentMethodChange(method.value)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                state.paymentMethod === method.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{method.icon}</span>
                <div className="flex-1">
                  <h4 className="font-medium">{method.label}</h4>
                  <p className="text-sm text-gray-500">{method.description}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    state.paymentMethod === method.value
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {state.paymentMethod === method.value && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
        >
          Буцах
        </button>
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Баталгаажуулж байна..." : "Цаг авах"}
        </button>
      </div>

      {/* QPay Modal */}
      {showQPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">QPay төлбөр</h3>
              <p className="text-gray-500 text-sm mb-4">
                {state.selectedService?.price.toLocaleString()}₮ төлөхийн тулд QR кодыг уншуулна уу
              </p>

              {/* QR Code Placeholder */}
              <div className="w-48 h-48 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-24 h-24 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" strokeWidth={2} />
                    <rect x="14" y="3" width="7" height="7" strokeWidth={2} />
                    <rect x="3" y="14" width="7" height="7" strokeWidth={2} />
                    <path d="M14 14h7v7h-7z" strokeWidth={2} />
                  </svg>
                  <p className="text-xs text-gray-400 mt-2">QR код энд харагдана</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowQPayModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg"
                >
                  Цуцлах
                </button>
                <button
                  onClick={async () => {
                    setShowQPayModal(false);
                    setIsSubmitting(true);
                    try {
                      await onConfirm();
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Төлөгдсөн
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
