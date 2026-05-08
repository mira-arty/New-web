"use client";

import { useState } from "react";
import { format } from "date-fns";
import { mn } from "date-fns/locale";

interface BookingDrawerProps {
  booking: {
    staffId: string;
    staffName: string;
    date: Date;
    booking: {
      id: string;
      customerName: string;
      customerPhone: string;
      serviceName: string;
      notes: string | null;
      status: string;
      price: number;
      startTime: string;
      endTime: string;
    };
  };
  onClose: () => void;
}

export default function BookingDrawer({ booking, onClose }: BookingDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(booking.booking.status);

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/business/bookings/${booking.booking.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed");

      setCurrentStatus(newStatus);
      
      if (newStatus === "completed" || newStatus === "cancelled" || newStatus === "no_show") {
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1000);
      }
    } catch {
      alert("Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      no_show: "bg-gray-100 text-gray-800",
    };
    const labels = {
      pending: "Хүлээгдэж байна",
      confirmed: "Баталгаажсан",
      completed: "Дууссан",
      cancelled: "Цуцлагдсан",
      no_show: "Ирээгүй",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Цаг авалтын дэлгэрэнгүй</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            {getStatusBadge(currentStatus)}
          </div>

          {/* Booking Details */}
          <div className="space-y-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Огноо</p>
                  <p className="font-medium">
                    {format(booking.date, "yyyy-MM-dd", { locale: mn })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Цаг</p>
                  <p className="font-medium">
                    {booking.booking.startTime} - {booking.booking.endTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ажилтан</p>
                  <p className="font-medium">{booking.staffName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Үнэ</p>
                  <p className="font-medium">
                    {booking.booking.price.toLocaleString()}₮
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Үйлчлүүлэгч</p>
              <p className="font-medium text-lg">{booking.booking.customerName}</p>
              <p className="text-sm text-gray-600">{booking.booking.customerPhone}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Үйлчилгээ</p>
              <p className="font-medium">{booking.booking.serviceName}</p>
            </div>

            {booking.booking.notes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Тэмдэглэл</p>
                <p className="text-gray-700">{booking.booking.notes}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {currentStatus !== "completed" && currentStatus !== "cancelled" && currentStatus !== "no_show" && (
            <div className="space-y-3">
              {currentStatus === "pending" && (
                <button
                  onClick={() => handleStatusChange("confirmed")}
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {loading ? "Хадгалж байна..." : "Баталгаажуулах"}
                </button>
              )}

              {currentStatus === "confirmed" && (
                <button
                  onClick={() => handleStatusChange("completed")}
                  disabled={loading}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {loading ? "Хадгалж байна..." : "Дуусгах"}
                </button>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusChange("no_show")}
                  disabled={loading}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Ирээгүй
                </button>
                <button
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={loading}
                  className="flex-1 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  Цуцлах
                </button>
              </div>
            </div>
          )}

          {currentStatus === "completed" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <svg className="w-8 h-8 mx-auto text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800 font-medium">Энэ цаг амжилттай дууссан</p>
            </div>
          )}

          {currentStatus === "cancelled" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-800 font-medium">Энэ цаг цуцлагдсан</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
