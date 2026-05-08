// Business profile page types

export interface BusinessDetail {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  coverUrl: string | null;
  logoUrl: string | null;
  gallery: string[];
  tags: string[];
  highlights: string[];
  socialLinks: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
  avgRating: number;
  reviewCount: number;
  businessHours: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }[];
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  duration: number;
  priceMin: number;
  priceMax: number;
  isActive: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  specialties: string[];
  rating: number;
}

export interface ReviewItem {
  id: string;
  customerName: string;
  customerAvatar: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface DayAvailability {
  date: Date;
  dayName: string;
  availableSlots: number;
}
