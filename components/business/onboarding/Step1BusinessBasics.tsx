"use client";

import { useState, useRef, useEffect } from "react";
import { OnboardingState, CATEGORIES } from "@/lib/types/onboarding";

interface Step1Props {
  state: OnboardingState;
  updateState: (updates: Partial<OnboardingState>) => void;
}

export default function Step1BusinessBasics({ state, updateState }: Step1Props) {
  const [uploading, setUploading] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressTimeout = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mapbox geocoding autocomplete
  const searchAddress = async (query: string) => {
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&` +
        `country=mn&` +
        `limit=5&` +
        `language=mn`
      );
      const data = await response.json();
      setAddressSuggestions(data.features || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  const handleAddressChange = (value: string) => {
    updateState({ address: value });
    
    clearTimeout(addressTimeout.current);
    addressTimeout.current = setTimeout(() => {
      searchAddress(value);
    }, 500);
  };

  const selectAddress = (feature: any) => {
    updateState({
      address: feature.place_name,
      location: {
        lng: feature.center[0],
        lat: feature.center[1],
      },
    });
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      
      const data = await res.json();
      updateState({ profilePhoto: data.url });
    } catch (error) {
      console.error("Upload error:", error);
      alert("Зураг оруулахад алдаа гарлаа");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (addressTimeout.current) clearTimeout(addressTimeout.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Бизнесийн үндсэн мэдээлэл</h2>

      {/* Business Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Бизнесийн нэр *
        </label>
        <input
          type="text"
          value={state.businessName}
          onChange={(e) => updateState({ businessName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Жишээ: Гоо сайхан салон"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ангилал *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => updateState({ category: cat.value as any })}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                state.category === cat.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="block text-sm font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Address with Geocoding */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Хаяг *
        </label>
        <input
          type="text"
          value={state.address}
          onChange={(e) => handleAddressChange(e.target.value)}
          onFocus={() => state.address.length >= 3 && setShowSuggestions(true)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Дүүрэг, хороо, байрны дугаар"
        />
        
        {showSuggestions && addressSuggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {addressSuggestions.map((feature, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectAddress(feature)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
              >
                <p className="text-sm font-medium text-gray-900">{feature.place_name}</p>
                <p className="text-xs text-gray-500">
                  {feature.center[1].toFixed(4)}, {feature.center[0].toFixed(4)}
                </p>
              </button>
            ))}
          </div>
        )}

        {state.location && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              <span className="font-medium">Байршил баталгаажсан:</span>{" "}
              {state.location.lat.toFixed(4)}, {state.location.lng.toFixed(4)}
            </p>
          </div>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Утасны дугаар *
        </label>
        <input
          type="tel"
          value={state.phone}
          onChange={(e) => updateState({ phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="+976 9911 2233"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Тайлбар
        </label>
        <textarea
          value={state.description}
          onChange={(e) => updateState({ description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Бизнесийнхээ талаар товч мэдээлэл оруулна уу..."
        />
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Профайл зураг
        </label>
        <div className="flex items-center gap-4">
          <div
            className={`w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden ${
              state.profilePhoto ? "border-blue-300" : "border-gray-300"
            }`}
          >
            {state.profilePhoto ? (
              <img
                src={state.profilePhoto}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {uploading ? "Оруулж байна..." : "Зураг оруулах"}
            </button>
            {state.profilePhoto && (
              <button
                type="button"
                onClick={() => updateState({ profilePhoto: null })}
                className="ml-2 text-sm text-red-600 hover:text-red-700"
              >
                Устгах
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
