"use client";

import Link from "next/link";
import { ServiceItem } from "@/lib/types/business-profile";

interface ServicesSectionProps {
  services: ServiceItem[];
  businessSlug: string;
}

export default function ServicesSection({ services, businessSlug }: ServicesSectionProps) {
  if (services.length === 0) return null;

  // Group by category
  const grouped = services.reduce((acc, service) => {
    const category = service.category || "Бусад";
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {} as Record<string, ServiceItem[]>);

  return (
    <section className="px-4 sm:px-6 py-6">
      <h2 className="text-xl font-semibold mb-4">Үйлчилгээ ({services.length})</h2>

      <div className="space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              {category}
            </h3>

            <div className="space-y-2">
              {items.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {service.duration} мин
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {service.priceMax > service.priceMin
                          ? `${service.priceMin.toLocaleString()} - ${service.priceMax.toLocaleString()}`
                          : service.priceMin.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">₮</p>
                    </div>

                    <Link
                      href={`/booking/${businessSlug}?service=${service.id}`}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Цаг авах
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
