// Booking flow types

export interface BookingService {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
}

export interface BookingStaff {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

export type PaymentMethod = "qpay" | "socialpay" | "venue";

export interface BookingState {
  step: number;
  businessId: string;
  businessName: string;
  businessSlug: string;
  
  // Step 1
  selectedService: BookingService | null;
  selectedStaff: BookingStaff | null; // null = any available
  
  // Step 2
  selectedDate: string | null; // YYYY-MM-DD
  selectedTime: string | null; // HH:mm
  
  // Step 3
  customerNotes: string;
  paymentMethod: PaymentMethod;
}

export const STEPS = [
  { number: 1, title: "Үйлчилгээ & Ажилтан", description: "Сонголт хийх" },
  { number: 2, title: "Огноо & Цаг", description: "Цаг товлох" },
  { number: 3, title: "Баталгаажуулах", description: "Төлбөр & баталгаа" },
];
