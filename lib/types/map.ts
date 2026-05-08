// B2C business discovery types

export interface BusinessWithDistance {
  id: string;
  name: string;
  slug: string;
  category: "salon" | "spa" | "dental" | "yoga" | "other";
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  phone: string;
  coverUrl: string | null;
  logoUrl: string | null;
  avgRating: number;
  reviewCount: number;
  distance: number; // in meters
  isOpen: boolean;
  businessHours: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }[];
}

export interface MapFilters {
  category: string | null;
  radius: number; // in meters
  minRating: number;
  openNow: boolean;
  query: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
}
