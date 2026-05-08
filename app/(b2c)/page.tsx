"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import MapboxMap from "@/components/b2c/map/MapView";
import FilterPanel from "@/components/b2c/search/FilterPanel";
import BusinessCard from "@/components/b2c/business-card/BusinessCard";
import { BusinessWithDistance, MapFilters, UserLocation } from "@/lib/types/map";

const DEFAULT_FILTERS: MapFilters = {
  category: null,
  radius: 3000,
  minRating: 0,
  openNow: false,
  query: "",
};

export default function HomePage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<BusinessWithDistance[]>([]);
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Location error:", error);
          // Default to Ulaanbaatar
          setUserLocation({ lat: 47.8864, lng: 106.9057 });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setUserLocation({ lat: 47.8864, lng: 106.9057 });
    }
  }, []);

  // Fetch businesses
  const fetchBusinesses = useCallback(async () => {
    if (!userLocation) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        lat: userLocation.lat.toString(),
        lng: userLocation.lng.toString(),
        radius: filters.radius.toString(),
        minRating: filters.minRating.toString(),
        openNow: filters.openNow.toString(),
      });

      if (filters.category) {
        params.set("category", filters.category);
      }

      if (filters.query) {
        params.set("query", filters.query);
      }

      const res = await fetch(`/api/businesses/search?${params}`);
      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      setBusinesses(data.businesses || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, [userLocation, filters]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchBusinesses();
    }, 500);

    return () => clearTimeout(timeout);
  }, [fetchBusinesses]);

  const handleBusinessSelect = (business: BusinessWithDistance) => {
    setSelectedBusinessId(business.id);
  };

  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b z-20 flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-blue-600">Timer.mn</h1>
            <span className="text-sm text-gray-500 hidden sm:inline">
              Ойролцоох бизнес хайх
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-lg transition-colors ${
                showFilters ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>

            <button
              onClick={() => router.push("/profile")}
              className="p-2.5 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Filter Sidebar */}
        {!isMobile && showFilters && (
          <div className="w-80 flex-shrink-0">
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              resultCount={businesses.length}
              isMobile={false}
            />
          </div>
        )}

        {/* Map */}
        <div className="flex-1 relative">
          <MapboxMap
            businesses={businesses}
            userLocation={userLocation}
            selectedBusinessId={selectedBusinessId}
            onBusinessSelect={handleBusinessSelect}
          />

          {/* Mobile Filter Button */}
          {isMobile && !showFilters && (
            <button
              onClick={() => setShowFilters(true)}
              className="absolute top-4 left-4 z-10 bg-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Шүүлтүүр
            </button>
          )}

          {/* Mobile Filter Bottom Sheet */}
          {isMobile && showFilters && (
            <div className="absolute inset-x-0 bottom-0 z-30">
              <div className="bg-white rounded-t-2xl shadow-xl max-h-[70vh] overflow-hidden">
                <div className="p-4">
                  <FilterPanel
                    filters={filters}
                    onChange={(newFilters) => {
                      setFilters(newFilters);
                      setShowFilters(false);
                    }}
                    resultCount={businesses.length}
                    isMobile={true}
                    onClose={() => setShowFilters(false)}
                  />
                </div>
              </div>
              <div
                className="absolute inset-0 bg-black bg-opacity-50 -z-10"
                onClick={() => setShowFilters(false)}
              />
            </div>
          )}

          {/* Mobile Results Bottom Sheet */}
          {isMobile && !showFilters && (
            <div
              className={`absolute inset-x-0 bottom-0 z-20 transition-transform ${
                showResults ? "translate-y-0" : "translate-y-[calc(100%-60px)]"
              }`}
            >
              {/* Handle */}
              <div
                className="bg-white rounded-t-2xl shadow-xl"
                onClick={() => setShowResults(!showResults)}
              >
                <div className="flex items-center justify-center py-3 cursor-pointer">
                  <div className="w-12 h-1 bg-gray-300 rounded-full" />
                </div>
                <div className="px-4 pb-2">
                  <p className="text-sm font-medium">
                    {businesses.length} бизнес олдлоо
                  </p>
                </div>
              </div>

              {/* Results List */}
              <div className="bg-white max-h-[50vh] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Хайж байна...</p>
                  </div>
                ) : businesses.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-gray-500">Бизнес олдсонгүй</p>
                  </div>
                ) : (
                  businesses.map((business) => (
                    <BusinessCard
                      key={business.id}
                      business={business}
                      isSelected={business.id === selectedBusinessId}
                      onClick={() => {
                        handleBusinessSelect(business);
                        setShowResults(false);
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Results Sidebar */}
        {!isMobile && (
          <div className="w-96 flex-shrink-0 bg-white border-l overflow-y-auto">
            <div className="p-4 border-b">
              <h2 className="font-semibold">
                {businesses.length} бизнес олдлоо
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Хайж байна...</p>
              </div>
            ) : businesses.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-500">Бизнес олдсонгүй</p>
              </div>
            ) : (
              businesses.map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  isSelected={business.id === selectedBusinessId}
                  onClick={() => handleBusinessSelect(business)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected Business Detail Bar (Mobile) */}
      {isMobile && selectedBusiness && !showResults && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white border-t shadow-lg">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                {selectedBusiness.logoUrl ? (
                  <img src={selectedBusiness.logoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    {({ salon: "✂️", spa: "🌸", dental: "🦷", yoga: "🧘", other: "📍" })[selectedBusiness.category]}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{selectedBusiness.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-400 text-sm">{"★".repeat(Math.round(selectedBusiness.avgRating))}</span>
                  <span className="text-xs text-gray-500">{selectedBusiness.avgRating.toFixed(1)}</span>
                </div>
              </div>
              <button
                onClick={() => router.push(`/business/${selectedBusiness.slug}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
              >
                Цаг авах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
