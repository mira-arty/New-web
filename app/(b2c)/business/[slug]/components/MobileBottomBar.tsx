"use client";

import Link from "next/link";

interface MobileBottomBarProps {
  priceMin: number;
  priceMax: number;
  businessSlug: string;
}

export default function MobileBottomBar({ priceMin, priceMax, businessSlug }: MobileBottomBarProps) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t shadow-lg md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-xs text-gray-500">Үнэ</p>
          <p className="font-semibold text-gray-900">
            {priceMax > priceMin
              ? `${priceMin.toLocaleString()} - ${priceMax.toLocaleString()}₮`
              : `${priceMin.toLocaleString()}₮`}
          </p>
        </div>

        <Link
          href={`/booking/${businessSlug}`}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Цаг авах
        </Link>
      </div>
    </div>
  );
}
