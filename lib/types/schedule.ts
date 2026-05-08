// Schedule-related types

export type SlotStatus = "confirmed" | "available" | "blocked" | "break" | "off";

export interface TimeSlot {
  time: string; // HH:mm
  endTime: string; // HH:mm
  status: SlotStatus;
  booking?: ScheduleBooking;
  breakInfo?: ScheduleBreak;
  exceptionInfo?: ScheduleException;
}

export interface ScheduleBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  notes: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  price: number;
  startTime: string;
  endTime: string;
}

export interface ScheduleBreak {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
}

export interface ScheduleException {
  id: string;
  reason: string;
  isFullDay: boolean;
  startTime?: string;
  endTime?: string;
}

export interface StaffSchedule {
  staffId: string;
  staffName: string;
  staffAvatar: string | null;
  slots: TimeSlot[];
  hasConflict?: boolean;
}

export interface DaySchedule {
  date: Date;
  staffSchedules: StaffSchedule[];
}

export interface BreakRule {
  id: string;
  label: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface ExceptionRule {
  id: string;
  staffId: string;
  staffName: string;
  startDate: Date;
  endDate: Date;
  isFullDay: boolean;
  startTime?: string;
  endTime?: string;
  reason: string;
}

export interface StaffAvailabilityRule {
  staffId: string;
  staffName: string;
  workingDays: boolean[]; // Mon-Sun
  startTime: string;
  endTime: string;
  breaks: BreakRule[];
}
