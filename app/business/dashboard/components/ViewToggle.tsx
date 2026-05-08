import { DashboardView } from "@/lib/types/dashboard";

interface ViewToggleProps {
  view: DashboardView;
  onViewChange: (view: DashboardView) => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
}

export default function ViewToggle({ view, onViewChange, dateRange, onDateRangeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex bg-gray-100 rounded-lg p-1">
        {([
          { value: "today" as const, label: "Өнөөдөр" },
          { value: "week" as const, label: "7 хоног" },
          { value: "custom" as const, label: "Тусгай" },
        ]).map((option) => (
          <button
            key={option.value}
            onClick={() => onViewChange(option.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === option.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {view === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">-</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
}
