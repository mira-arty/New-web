"use client";

interface HighlightsEditorProps {
  highlights: string[];
  options: { id: string; label: string; icon: string }[];
  onChange: (highlights: string[]) => void;
}

export default function HighlightsEditor({ highlights, options, onChange }: HighlightsEditorProps) {
  const toggleHighlight = (id: string) => {
    if (highlights.includes(id)) {
      onChange(highlights.filter((h) => h !== id));
    } else {
      onChange([...highlights, id]);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Онцлогууд</h3>

      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => {
          const isActive = highlights.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggleHighlight(option.id)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                isActive
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isActive
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {isActive && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium">{option.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
