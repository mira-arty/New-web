"use client";

import { StaffMember } from "@/lib/types/business-profile";

interface StaffSectionProps {
  staff: StaffMember[];
}

export default function StaffSection({ staff }: StaffSectionProps) {
  if (staff.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 py-6">
      <h2 className="text-xl font-semibold mb-4">Ажилчид ({staff.length})</h2>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        {staff.map((member) => (
          <div
            key={member.id}
            className="flex-shrink-0 w-40 bg-white border border-gray-200 rounded-xl overflow-hidden"
          >
            <div className="h-32 bg-gray-100 relative">
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-50">
                  <span className="text-3xl">👤</span>
                </div>
              )}
            </div>

            <div className="p-3">
              <h3 className="font-medium text-gray-900 truncate">{member.name}</h3>
              <p className="text-sm text-gray-500 truncate">{member.role}</p>

              {member.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {member.specialties.slice(0, 2).map((specialty) => (
                    <span
                      key={specialty}
                      className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                  {member.specialties.length > 2 && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      +{member.specialties.length - 2}
                    </span>
                  )}
                </div>
              )}

              {member.rating > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-sm font-medium">{member.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
