export interface OnboardingState {
  // Step 1: Business Basics
  businessName: string;
  category: "salon" | "spa" | "dental" | "yoga" | "other";
  address: string;
  location: { lat: number; lng: number } | null;
  phone: string;
  profilePhoto: string | null; // URL
  description: string;

  // Step 2: Services
  services: ServiceInput[];

  // Step 3: Staff
  staff: StaffInput[];

  // Step 4: Business Hours
  businessHours: BusinessHourInput[];
  advanceBookingLimit: "1_day" | "1_week" | "2_weeks" | "1_month";
  bufferTime: 0 | 10 | 15 | 30;
  cancellationPolicy: string;

  // Meta
  currentStep: number;
  isDraft: boolean;
}

export interface ServiceInput {
  id: string;
  name: string;
  duration: 15 | 30 | 45 | 60 | 90 | 120;
  priceMin: number;
  priceMax: number;
}

export interface StaffInput {
  id: string;
  name: string;
  role: string;
  phone: string;
  avatarUrl: string | null;
  serviceIds: string[]; // References to service IDs
  workSchedule: WorkDayInput[];
}

export interface WorkDayInput {
  day: number; // 0-6 (Mon-Sun)
  dayName: string;
  isWorking: boolean;
  startTime: string;
  endTime: string;
}

export interface BusinessHourInput {
  day: number; // 0-6
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120] as const;
export const BUFFER_TIME_OPTIONS = [0, 10, 15, 30] as const;
export const ADVANCE_BOOKING_OPTIONS = [
  { value: "1_day", label: "1 хоног" },
  { value: "1_week", label: "1 долоо хоног" },
  { value: "2_weeks", label: "2 долоо хоног" },
  { value: "1_month", label: "1 сар" },
] as const;

export const WEEKDAYS = [
  { day: 0, name: "Даваа", short: "Да" },
  { day: 1, name: "Мягмар", short: "Мя" },
  { day: 2, name: "Лхагва", short: "Лх" },
  { day: 3, name: "Пүрэв", short: "Пү" },
  { day: 4, name: "Баасан", short: "Ба" },
  { day: 5, name: "Бямба", short: "Бя" },
  { day: 6, name: "Ням", short: "Ня" },
] as const;

export const CATEGORIES = [
  { value: "salon", label: "Үсчин салон", icon: "Scissors" },
  { value: "spa", label: "Гоо сайхан", icon: "Sparkles" },
  { value: "dental", label: "Шүдний эмнэлэг", icon: "Smile" },
  { value: "yoga", label: "Йога студи", icon: "Activity" },
  { value: "other", label: "Бусад", icon: "Building2" },
] as const;
