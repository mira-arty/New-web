"use client";

import { useState } from "react";
import Link from "next/link";
import { BusinessDetail } from "@/lib/types/business-profile";

interface HeroSectionProps {
  business: BusinessDetail;
}

const CATEGORY_LABELS: Record<string, string> = {
  salon: "Үсчин салон",
  spa: "Гоо сайхан",
  dental: "Шүдний эмнэлэг",
  yoga: "Йога студи",
  other: "Бусад",
};

const WEEKDAYS = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"];

export default function HeroSection({ business }: HeroSectionProps) {
  const [showHours, setShowHours] = useState(false);

  // Get today's hours
  const today = new Date();
  const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const todayHours = business.businessHours.find((h) => h.dayOfWeek === todayIndex);

  const isOpen = todayHours && !todayHours.isClosed;
  const currentTime = `${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`;
  const isCurrentlyOpen = isOpen && currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;

  return (
    <div className="relative">
      {/* Cover Photo */}
      <div className="h-64 sm:h-80 w-full relative">
        {business.coverUrl ? (
          <img
            src={business.coverUrl}
            alt={business.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <svg className="w-20 h-20 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="px-4 sm:px-6 -mt-16 relative z-10">
        <div className="flex items-end gap-4">
          {/* Logo */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white p-1 shadow-lg flex-shrink-0">
            <div className="w-full h-full rounded-xl bg-gray-100 overflow-hidden">
              {business.logoUrl ? (
                <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-3xl font-bold">
                  {business.name[0]}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-2">
            <Link
              href={`tel:${business.phone}`}
              className="p-2.5 bg-white rounded-full shadow-md hover:bg-gray-50"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </Link>
            <button className="p-2.5 bg-white rounded-full shadow-md hover:bg-gray-50">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button className="p-2.5 bg-white rounded-full shadow-md hover:bg-gray-50">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Business Info */}
        <div className="mt-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{business.name}</h1>

          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {CATEGORY_LABELS[business.category] || business.category}
            </span>

            {business.avgRating > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span className="font-semibold">{business.avgRating.toFixed(1)}</span>
                <span className="text-gray-500 text-sm">({business.reviewCount} сэтгэгдэл)</span>
              </div>
            )}
          </div>

          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">{business.address}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-sm">{business.phone}</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex items-center gap-2">
                {isCurrentlyOpen ? (
                  <span className="text-green-600 text-sm font-medium">Нээлттэй</span>
                ) : (
                  <span className="text-red-600 text-sm font-medium">Хаалттай</span>
                )}
                <span className="text-gray-500 text-sm">
                  {todayHours?.isClosed
                    ? "Амралтын өдөр"
                    : `${todayHours?.openTime} - ${todayHours?.closeTime}`}
                </span>
                <button
                  onClick={() => setShowHours(!showHours)}
                  className="text-blue-600 text-sm hover:underline"
                >
                  {showHours ? "Хаах" : "Бүх цаг"}
                </button>
              </div>
            </div>
          </div>

          {/* Full Hours */}
          {showHours && (
            <div className="mt-3 bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                {WEEKDAYS.map((day, index) => {
                  const hours = business.businessHours.find((h) => h.dayOfWeek === index);
                  const isToday = index === todayIndex;
                  return (
                    <div
                      key={day}
                      className={`flex justify-between text-sm ${isToday ? "font-medium text-blue-600" : "text-gray-600"}`}
                    >
                      <span>{day} {isToday && "(өнөөдөр)"}</span>
                      <span>
                        {hours?.isClosed
                          ? "Хаалттай"
                          : `${hours?.openTime} - ${hours?.closeTime}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
