"use client";

import { useState } from "react";
import { format } from "date-fns";
import { mn } from "date-fns/locale";

interface SlotModalProps {
  slot: {
    staffId: string;
    staffName: string;
    date: Date;
    slot: {
      time: string;
      endTime: string;
      status: string;
    };
  };
  onClose: () => void;
}

export default function SlotModal({ slot, onClose }: SlotModalProps) {
  const [action, setAction] = useState<"block" | "break" | "booking" | null>(null);
  const [loading, setLoading] = useState(false);

  // Block time form
  const [blockReason, setBlockReason] = useState("");

  // Break form
  const [breakLabel, setBreakLabel] = useState("Завсарлага");
  const [breakDuration, setBreakDuration] = useState(30);

  // Booking form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      let body = {};

      switch (action) {
        case "block":
          endpoint = "/api/business/schedule/block";
          body = {
            staffId: slot.staffId,
            date: slot.date.toISOString(),
            startTime: slot.slot.time,
            endTime: slot.slot.endTime,
            reason: blockReason,
          };
          break;
        case "break":
          endpoint = "/api/business/schedule/break";
          body = {
            staffId: slot.staffId,
            date: slot.date.toISOString(),
            startTime: slot.slot.time,
            endTime: format(
              new Date(slot.date).setHours(
                Number(slot.slot.time.split(":")[0]),
                Number(slot.slot.time.split(":")[1]) + breakDuration
              ),
              "HH:mm"
            ),
            label: breakLabel,
          };
          break;
        case "booking":
          endpoint = "/api/business/schedule/booking";
          body = {
            staffId: slot.staffId,
            date: slot.date.toISOString(),
            startTime: slot.slot.time,
            endTime: slot.slot.endTime,
            customerName,
            customerPhone,
            serviceId,
            notes: bookingNotes,
          };
          break;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed");

      onClose();
      window.location.reload();
    } catch {
      alert("Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">
                {format(slot.date, "EEEE, MMMM d", { locale: mn })}
              </h3>
              <p className="text-sm text-gray-500">
                {slot.staffName} · {slot.slot.time} - {slot.slot.endTime}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!action ? (
            <div className="space-y-3">
              <button
                onClick={() => setAction("block")}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Цаг хаах</div>
                    <div className="text-sm text-gray-500">Энэ цагийг хүн авах боломжгүй болгох</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setAction("break")}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Завсарлага нэмэх</div>
                    <div className="text-sm text-gray-500">Ажилтны завсарлага бүртгэх</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setAction("booking")}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Гараар цаг авах</div>
                    <div className="text-sm text-gray-500">Үйлчлүүлэгчийн цаг авах</div>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setAction(null)}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Буцах
              </button>

              {action === "block" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Хаах шалтгаан
                  </label>
                  <input
                    type="text"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Жишээ: Хувийн хэрэг"
                  />
                </div>
              )}

              {action === "break" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Нэр
                    </label>
                    <input
                      type="text"
                      value={breakLabel}
                      onChange={(e) => setBreakLabel(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Үргэлжлэх хугацаа (минут)
                    </label>
                    <select
                      value={breakDuration}
                      onChange={(e) => setBreakDuration(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value={15}>15 минут</option>
                      <option value={30}>30 минут</option>
                      <option value={45}>45 минут</option>
                      <option value={60}>1 цаг</option>
                    </select>
                  </div>
                </>
              )}

              {action === "booking" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Үйлчлүүлэгчийн нэр *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Бат Эрдэнэ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Утас *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="9911 2233"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Үйлчилгээ *
                    </label>
                    <select
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Үйлчилгээ сонгох</option>
                      <option value="svc1">Үс шингэлэх - 50,000₮</option>
                      <option value="svc2">Массаж - 80,000₮</option>
                      <option value="svc3">Нүүр будалт - 60,000₮</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Тэмдэглэл
                    </label>
                    <textarea
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Нэмэлт мэдээлэл..."
                    />
                  </div>
                </>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-2 px-4 rounded-lg text-white font-medium disabled:opacity-50 ${
                  action === "block"
                    ? "bg-red-600 hover:bg-red-700"
                    : action === "break"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Хадгалж байна..." : "Хадгалах"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
