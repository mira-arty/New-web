"use client";

import { useState, useEffect } from "react";
import { BookingService, BookingStaff } from "@/lib/types/booking";

interface Step1Props {
  businessId: string;
  selectedService: BookingService | null;
  selectedStaff: BookingStaff | null;
  onServiceSelect: (service: BookingService) => void;
  onStaffSelect: (staff: BookingStaff | null) => void;
  onNext: () => void;
}

export default function Step1ServiceStaff({
  businessId,
  selectedService,
  selectedStaff,
  onServiceSelect,
  onStaffSelect,
  onNext,
}: Step1Props) {
  const [services, setServices] = useState<BookingService[]>([]);
  const [staff, setStaff] = useState<BookingStaff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, staffRes] = await Promise.all([
          fetch(`/api/businesses/${businessId}/services`),
          fetch(`/api/businesses/${businessId}/staff`),
        ]);

        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setServices(servicesData);
        }

        if (staffRes.ok) {
          const staffData = await staffRes.json();
          setStaff(staffData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [businessId]);

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const category = service.category || "Бусад";
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {} as Record<string, BookingService[]>);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
        <p className="text-gray-500">Ачаалж байна...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Services */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Үйлчилгээ сонгох</h2>

        <div className="space-y-6">
          {Object.entries(groupedServices).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                {category}
              </h3>

              <div className="space-y-2">
                {items.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => onServiceSelect(service)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      selectedService?.id === service.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {service.duration} мин
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{service.price.toLocaleString()}₮</p>
                        {selectedService?.id === service.id && (
                          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mt-1 ml-auto">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Ажилтан сонгох (заавал биш)</h2>

        <div className="space-y-2">
          {/* Any available option */}
          <button
            onClick={() => onStaffSelect(null)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              selectedStaff === null
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">Боломжтой ажилтан</h4>
                <p className="text-sm text-gray-500">Систем автоматаар сонгоно</p>
              </div>
            </div>
          </button>

          {/* Staff cards */}
          {staff.map((member) => (
            <button
              key={member.id}
              onClick={() => onStaffSelect(member)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                selectedStaff?.id === member.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xl">👤</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{member.name}</h4>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
                {selectedStaff?.id === member.id && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Summary */}
      {(selectedService || selectedStaff) && (
        <div className="sticky bottom-0 bg-white border-t p-4 -mx-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedService && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {selectedService.name}
                <button onClick={() => onServiceSelect(null as any)} className="hover:text-blue-900">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {selectedStaff && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {selectedStaff.name}
                <button onClick={() => onStaffSelect(null)} className="hover:text-green-900">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
          </div>

          <button
            onClick={onNext}
            disabled={!selectedService}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Үргэлжлүүлэх
          </button>
        </div>
      )}
    </div>
  );
}
