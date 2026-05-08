"use client";

import { useState, useCallback, useRef } from "react";

interface SlugEditorProps {
  slug: string;
  onChange: (slug: string) => void;
}

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export default function SlugEditor({ slug, onChange }: SlugEditorProps) {
  const [status, setStatus] = useState<SlugStatus>("idle");
  const [currentSlug, setCurrentSlug] = useState(slug);
  const checkTimeoutRef = useRef<NodeJS.Timeout>();

  const checkSlug = useCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setStatus("invalid");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(value)) {
      setStatus("invalid");
      return;
    }

    setStatus("checking");

    try {
      const res = await fetch(`/api/check-slug?slug=${encodeURIComponent(value)}`);
      const data = await res.json();

      if (res.ok && data.available) {
        setStatus("available");
      } else {
        setStatus("taken");
      }
    } catch {
      setStatus("idle");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setCurrentSlug(value);
    onChange(value);

    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    if (value.length >= 3) {
      checkTimeoutRef.current = setTimeout(() => {
        checkSlug(value);
      }, 500);
    } else {
      setStatus("idle");
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "checking":
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
        );
      case "available":
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "taken":
      case "invalid":
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "checking":
        return "Шалгаж байна...";
      case "available":
        return "Боломжтой";
      case "taken":
        return "Аль хэдийн ашиглагдаж байна";
      case "invalid":
        return "3-аас дээш тэмдэгт, зөвхөн latin үсэг, тоо, зураас";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Холбоос</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Таны холбоос
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 whitespace-nowrap">
            timer.mn/b/
          </span>
          <div className="relative flex-1">
            <input
              type="text"
              value={currentSlug}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                status === "available"
                  ? "border-green-300 focus:ring-green-500"
                  : status === "taken" || status === "invalid"
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="your-business"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {getStatusIcon()}
            </div>
          </div>
        </div>

        {status !== "idle" && (
          <p
            className={`text-sm mt-1 ${
              status === "available"
                ? "text-green-600"
                : status === "taken" || status === "invalid"
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {getStatusText()}
          </p>
        )}
      </div>
    </div>
  );
}
