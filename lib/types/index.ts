// ============================================================
// Timer.mn — Shared TypeScript Interfaces
// Multi-tenant appointment booking platform for Mongolia
// ============================================================

// ------------------------------------------------------------------
// Enums
// ------------------------------------------------------------------

export enum BusinessCategory {
  HAIR_SALON = "hair_salon",
  BEAUTY_SPA = "beauty_spa",
  DENTAL_CLINIC = "dental_clinic",
  YOGA_STUDIO = "yoga_studio",
  NAIL_SALON = "nail_salon",
  MASSAGE_THERAPY = "massage_therapy",
  FITNESS_CENTER = "fitness_center",
  BARBER_SHOP = "barber_shop",
}

export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  NO_SHOW = "no_show",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
  PARTIAL_REFUND = "partial_refund",
}

export enum PaymentMethod {
  QPAY = "qpay",
  SOCIALPAY = "socialpay",
  CASH = "cash",
  CARD = "card",
}

export enum UserRole {
  CUSTOMER = "customer",
  BUSINESS_OWNER = "business_owner",
  STAFF = "staff",
  ADMIN = "admin",
}

export enum DayOfWeek {
  MONDAY = "monday",
  TUESDAY = "tuesday",
  WEDNESDAY = "wednesday",
  THURSDAY = "thursday",
  FRIDAY = "friday",
  SATURDAY = "saturday",
  SUNDAY = "sunday",
}

// ------------------------------------------------------------------
// Location / Address
// ------------------------------------------------------------------

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  district: string;
  city: string;
  country: string;
}

export interface GeoJSONPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

// ------------------------------------------------------------------
// User
// ------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// ------------------------------------------------------------------
// Business
// ------------------------------------------------------------------

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  category: BusinessCategory;
  subcategories: string[];
  logoUrl: string | null;
  coverImageUrl: string | null;
  location: Location;
  geoLocation: GeoJSONPoint;
  phone: string;
  email: string;
  website: string | null;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    googleMaps?: string;
  };
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isActive: boolean;
  businessHours: BusinessHours[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessHours {
  day: DayOfWeek;
  openTime: string; // "HH:mm" format
  closeTime: string; // "HH:mm" format
  isOpen: boolean;
}

// ------------------------------------------------------------------
// Service
// ------------------------------------------------------------------

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number; // in MNT
  category: string;
  imageUrl: string | null;
  isActive: boolean;
  requiresDeposit: boolean;
  depositAmount: number | null;
  staffIds: string[]; // Staff who can perform this service
  createdAt: Date;
  updatedAt: Date;
}

// ------------------------------------------------------------------
// Staff
// ------------------------------------------------------------------

export interface Staff {
  id: string;
  businessId: string;
  userId: string | null; // Linked user account (optional)
  name: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  bio: string | null;
  specialties: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  workSchedule: WorkSchedule[];
  breakTimes: BreakTime[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkSchedule {
  day: DayOfWeek;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  isWorking: boolean;
}

export interface BreakTime {
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

// ------------------------------------------------------------------
// Booking / Appointment
// ------------------------------------------------------------------

export interface Booking {
  id: string;
  businessId: string;
  serviceId: string;
  staffId: string | null; // Optional: specific staff requested
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string | null;
  status: BookingStatus;
  date: Date; // Appointment date
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  duration: number; // in minutes
  price: number;
  depositAmount: number | null;
  cancellationReason: string | null;
  cancelledAt: Date | null;
  cancelledBy: string | null;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  isAvailable: boolean;
  staffId: string | null;
}

// ------------------------------------------------------------------
// Review
// ------------------------------------------------------------------

export interface Review {
  id: string;
  businessId: string;
  serviceId: string | null;
  staffId: string | null;
  bookingId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  title: string | null;
  comment: string;
  reply: string | null;
  repliedAt: Date | null;
  isVerified: boolean; // Verified booking
  helpfulCount: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ------------------------------------------------------------------
// Payment
// ------------------------------------------------------------------

export interface Payment {
  id: string;
  bookingId: string;
  businessId: string;
  customerId: string;
  amount: number; // in MNT
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string | null; // External payment provider ID
  invoiceNumber: string;
  paidAt: Date | null;
  refundedAt: Date | null;
  refundAmount: number | null;
  refundReason: string | null;
  metadata: {
    qpayInvoiceId?: string;
    socialpayInvoiceId?: string;
    qrCode?: string;
    deepLink?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentIntent {
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  returnUrl: string;
}

// ------------------------------------------------------------------
// Search / Filter Types
// ------------------------------------------------------------------

export interface SearchFilters {
  category?: BusinessCategory;
  subcategory?: string;
  query?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  };
  date?: Date;
  minRating?: number;
  maxPrice?: number;
  isOpenNow?: boolean;
  sortBy?: "distance" | "rating" | "price" | "popularity";
}

export interface SearchResult {
  business: Business;
  distance: number | null; // in kilometers
  availableSlots: TimeSlot[];
}

// ------------------------------------------------------------------
// Notification
// ------------------------------------------------------------------

export interface Notification {
  id: string;
  userId: string;
  type: "booking_confirmed" | "booking_reminder" | "booking_cancelled" | "payment_received" | "review_received" | "new_booking";
  title: string;
  message: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

// ------------------------------------------------------------------
// API Response Types
// ------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
