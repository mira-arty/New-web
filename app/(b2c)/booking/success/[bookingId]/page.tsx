"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { mn } from "date-fns/locale";

interface BookingSuccessPageProps {
  params: {
    bookingId: string;
  };
}

interface BookingDetails {
  id: string;
  businessName: string;
  serviceName: string;
  staffName: string | null;
  date: string;
  time: string;
  price: number;
  status: string;
}

export default function BookingSuccessPage({ params }: BookingSuccessPageProps) {
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${params.bookingId}`);
        if (!res.ok) throw new Error("Failed to load booking");
        const data = await res.json();
        setBooking(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [params.bookingId]);

  const addToCalendar = () => {
    if (!booking) return;
    
    const date = parseISO(booking.date);
    const [hours, minutes] = booking.time.split(":").map(Number);
    date.setHours(hours, minutes);
    
    const endDate = new Date(date);
    endDate.setMinutes(endDate.getMinutes() + 60);
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      booking.serviceName
    )}&dates=${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z/${endDate
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0]}Z&details=${encodeURIComponent(
      `Цаг авалт: ${booking.businessName}`
    )}`;
    
    window.open(googleCalendarUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Цаг авалт олдсонгүй</p>
          <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
            Нүүр хуудас руу буцах
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Цаг амжилттай авлаа!</h1>
          <p className="text-gray-500 mb-8">
            Баталгаажуулалтын имэйл илгээгдлээ
          </p>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Бизнес</span>
                <span className="font-medium">{booking.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Үйлчилгээ</span>
                <span className="font-medium">{booking.serviceName}</span>
              </div>
              {booking.staffName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Ажилтан</span>
                  <span className="font-medium">{booking.staffName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Огноо</span>
                <span className="font-medium">
                  {format(parseISO(booking.date), "EEEE, MMMM d", { locale: mn })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Цаг</span>
                <span className="font-medium">{booking.time}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-500">Үнэ</span>
                <span className="font-bold">{booking.price.toLocaleString()}₮</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={addToCalendar}
              className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Календарт нэмэх
            </button>

            <Link
              href="/profile"
              className="block w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-center"
            >
              Миний цагууд
            </Link>

            <Link
              href="/"
              className="block w-full py-3 text-gray-500 hover:text-gray-700 text-center text-sm"
            >
              Нүүр хуудас руу буцах
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
