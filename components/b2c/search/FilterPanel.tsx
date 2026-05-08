"use client";

import { useState } from "react";
import { MapFilters } from "@/lib/types/map";

interface FilterPanelProps {
  filters: MapFilters;
  onChange: (filters: MapFilters) => void;
  resultCount: number;
  isMobile: boolean;
  onClose?: () => void;
}

const CATEGORIES = [
  { value: "all", label: "Бүгд", emoji: "📍" },
  { value: "salon", label: "Салон", emoji: "✂️" },
  { value: "spa", label: "Спа", emoji: "🌸" },
  { value: "dental", label: "Шүд", emoji: "🦷" },
  { value: "yoga", label: "Йога", emoji: "🧘" },
];

const RATING_OPTIONS = [
  { value: 0, label: "Бүгд" },
  { value: 3, label: "3+ ⭐" },
  { value: 4, label: "4+ ⭐" },
  { value: 4.5, label: "4.5+ ⭐" },
];

export default function FilterPanel({ filters, onChange, resultCount, isMobile, onClose }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const updateFilter = <K extends keyof MapFilters>(key: K, value: MapFilters[K]) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onChange(updated);
  };

  return (
    <div className={`bg-white h-full overflow-y-auto ${isMobile ? "" : "border-r border-gray-200"}`}>
      <div className="p-4 space-y-6">
        {/* Mobile close button */}
        {isMobile && onClose && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Шүүлтүүр</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Хайлт
          </label>
          <div className="relative">
            <input
              type="text"
              value={localFilters.query}
              onChange={(e) => updateFilter("query", e.target.value)}
              placeholder="Бизнесийн нэр..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ангилал
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() =>
                  updateFilter("category", cat.value === "all" ? null : cat.value)
                }
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  (cat.value === "all" && !localFilters.category) ||
                  localFilters.category === cat.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="mr-1">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Distance Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Зай
            </label>
            <span className="text-sm text-blue-600 font-medium">
              {localFilters.radius < 1000
                ? `${localFilters.radius}м`
                : `${(localFilters.radius / 1000).toFixed(1)}км`}
            </span>
          </div>
          <input
            type="range"
            min={500}
            max={5000}
            step={500}
            value={localFilters.radius}
            onChange={(e) => updateFilter("radius", Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>500м</span>
            <span>5км</span>
          </div>
        </div>

        {/* Min Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Үнэлгээ
          </label>
          <div className="flex gap-2">
            {RATING_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => updateFilter("minRating", option.value)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  localFilters.minRating === option.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Open Now Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Одоо нээлттэй
          </label>
          <button
            onClick={() => updateFilter("openNow", !localFilters.openNow)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localFilters.openNow ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localFilters.openNow ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Result Count */}
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600 text-center">
            <span className="font-semibold text-gray-900">{resultCount}</span> бизнес олдлоо
          </p>
        </div>
      </div>
    </div>
  );
}
