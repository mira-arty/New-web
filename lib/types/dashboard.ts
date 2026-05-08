// Business dashboard types

export interface DashboardBooking {
  id: string;
  time: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  staffName: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  price: number;
  hasReminderSent: boolean;
}

export interface DashboardSummary {
  todayBookings: number;
  pendingConfirmations: number;
  todayRevenue: number;
  emptySlotsToday: number;
}

export interface DashboardNotification {
  id: string;
  type: "new_booking" | "cancellation" | "new_review" | "no_show";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  bookingId?: string;
}

export interface DailyStat {
  date: string;
  bookings: number;
  revenue: number;
}

export type DashboardView = "today" | "week" | "custom";
