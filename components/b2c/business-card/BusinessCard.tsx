"use client";

import { BusinessWithDistance } from "@/lib/types/map";

interface BusinessCardProps {
  business: BusinessWithDistance;
  isSelected: boolean;
  onClick: () => void;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  salon: "✂️",
  spa: "🌸",
  dental: "🦷",
  yoga: "🧘",
  other: "📍",
};

export default function BusinessCard({ business, isSelected, onClick }: BusinessCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-all border-b ${
        isSelected
          ? "bg-blue-50 border-blue-200"
          : "bg-white hover:bg-gray-50 border-gray-100"
      }`}
    >
      <div className="flex gap-3">
        {/* Logo */}
        <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
          {business.logoUrl ? (
            <img
              src={business.logoUrl}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {CATEGORY_EMOJIS[business.category] || "📍"}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {business.name}
          </h3>

          <div className="flex items-center gap-1 mt-1">
            <span className="text-yellow-400 text-sm">
              {"★".repeat(Math.round(business.avgRating))}
            </span>
            <span className="text-gray-300 text-sm">
              {"☆".repeat(5 - Math.round(business.avgRating))}
            </span>
            <span className="text-xs text-gray-500 ml-1">
              {business.avgRating.toFixed(1)} ({business.reviewCount})
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">
              {business.distance < 1000
                ? `${Math.round(business.distance)}м`
                : `${(business.distance / 1000).toFixed(1)}км`} зайд
            </span>
            {business.isOpen ? (
              <span className="text-xs text-green-600 font-medium">Нээлттэй</span>
            ) : (
              <span className="text-xs text-red-600 font-medium">Хаалттай</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
