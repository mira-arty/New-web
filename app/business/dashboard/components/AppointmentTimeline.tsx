import { DashboardBooking } from "@/lib/types/dashboard";

interface AppointmentTimelineProps {
  bookings: DashboardBooking[];
  view: string;
  onStatusChange: (bookingId: string, status: string) => void;
  onSendReminder: (bookingId: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; className: string; actions: string[] }> = {
  pending: {
    label: "Хүлээгдэж байна",
    className: "bg-yellow-100 text-yellow-800",
    actions: ["confirmed", "cancelled"],
  },
  confirmed: {
    label: "Баталгаажсан",
    className: "bg-blue-100 text-blue-800",
    actions: ["completed", "no_show", "cancelled"],
  },
  completed: {
    label: "Дууссан",
    className: "bg-green-100 text-green-800",
    actions: [],
  },
  cancelled: {
    label: "Цуцлагдсан",
    className: "bg-red-100 text-red-800",
    actions: [],
  },
  no_show: {
    label: "Ирээгүй",
    className: "bg-gray-100 text-gray-800",
    actions: [],
  },
};

const ACTION_LABELS: Record<string, string> = {
  confirmed: "Баталгаажуулах",
  completed: "Дуусгах",
  cancelled: "Цуцлах",
  no_show: "Ирээгүй",
};

const ACTION_COLORS: Record<string, string> = {
  confirmed: "bg-blue-600 hover:bg-blue-700",
  completed: "bg-green-600 hover:bg-green-700",
  cancelled: "bg-red-600 hover:bg-red-700",
  no_show: "bg-gray-600 hover:bg-gray-700",
};

export default function AppointmentTimeline({
  bookings,
  onStatusChange,
  onSendReminder,
}: AppointmentTimelineProps) {
  // Sort by time
  const sortedBookings = [...bookings].sort((a, b) => a.time.localeCompare(b.time));

  if (sortedBookings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500">Цаг авалт байхгүй</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цаг</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Үйлчлүүлэгч</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Үйлчилгээ</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ажилтан</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Төлөв</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Үйлдэл</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedBookings.map((booking) => {
              const status = STATUS_CONFIG[booking.status];
              
              return (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-medium">{booking.time}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{booking.customerName}</p>
                      <p className="text-sm text-gray-500">{booking.customerPhone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {booking.serviceName}
                  </td>
                  <td className="px-4 py-3">
                    {booking.staffName || "Боломжтой ажилтан"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {status.actions.map((action) => (
                        <button
                          key={action}
                          onClick={() => onStatusChange(booking.id, action)}
                          className={`px-3 py-1 text-xs font-medium text-white rounded-lg transition-colors ${ACTION_COLORS[action]}`}
                        >
                          {ACTION_LABELS[action]}
                        </button>
                      ))}
                      
                      {booking.status === "confirmed" && !booking.hasReminderSent && (
                        <button
                          onClick={() => onSendReminder(booking.id)}
                          className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                        >
                          Сануулах
                        </button>
                      )}
                      {booking.hasReminderSent && (
                        <span className="text-xs text-green-600">✓ Сануулсан</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
