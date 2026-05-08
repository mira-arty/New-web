import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import HeroSection from "./components/HeroSection";
import GallerySection from "./components/GallerySection";
import ServicesSection from "./components/ServicesSection";
import StaffSection from "./components/StaffSection";
import ReviewsSection from "./components/ReviewsSection";
import AvailabilitySection from "./components/AvailabilitySection";
import MobileBottomBar from "./components/MobileBottomBar";
import { BusinessDetail, ServiceItem, StaffMember, ReviewItem, DayAvailability } from "@/lib/types/business-profile";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const business = await fetchBusiness(params.slug);
  
  if (!business) {
    return {
      title: "Бизнес олдсонгүй | Timer.mn",
    };
  }

  return {
    title: `${business.name} | Timer.mn`,
    description: business.description || `${business.name} - ${business.address}`,
    openGraph: {
      title: business.name,
      description: business.description || business.address,
      images: business.coverUrl ? [business.coverUrl] : [],
    },
  };
}

async function fetchBusiness(slug: string): Promise<BusinessDetail | null> {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: business, error } = await supabase
      .from("businesses")
      .select(`
        id, name, slug, category, description, address, phone,
        cover_url, logo_url, gallery, tags, highlights, social_links,
        avg_rating, review_count,
        business_hours (day_of_week, open_time, close_time, is_closed)
      `)
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !business) return null;

    return {
      id: business.id,
      name: business.name,
      slug: business.slug,
      category: business.category,
      description: business.description || "",
      address: business.address,
      phone: business.phone || "",
      coverUrl: business.cover_url,
      logoUrl: business.logo_url,
      gallery: business.gallery || [],
      tags: business.tags || [],
      highlights: business.highlights || [],
      socialLinks: business.social_links || { instagram: "", facebook: "", tiktok: "" },
      avgRating: business.avg_rating || 0,
      reviewCount: business.review_count || 0,
      businessHours: (business.business_hours || []).map((h: any) => ({
        dayOfWeek: h.day_of_week,
        openTime: h.open_time,
        closeTime: h.close_time,
        isClosed: h.is_closed,
      })),
    };
  } catch {
    return null;
  }
}

async function fetchServices(businessId: string): Promise<ServiceItem[]> {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data, error } = await supabase
      .from("services")
      .select("id, name, category, duration_minutes, price_min, price_max, is_active")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .order("category");

    if (error) return [];

    return (data || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      category: s.category || "Бусад",
      duration: s.duration_minutes,
      priceMin: s.price_min,
      priceMax: s.price_max || s.price_min,
      isActive: s.is_active,
    }));
  } catch {
    return [];
  }
}

async function fetchStaff(businessId: string): Promise<StaffMember[]> {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data, error } = await supabase
      .from("staff")
      .select("id, name, role, avatar_url, specialties, rating")
      .eq("business_id", businessId)
      .eq("is_active", true);

    if (error) return [];

    return (data || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      role: s.role || "Мастер",
      avatarUrl: s.avatar_url,
      specialties: s.specialties || [],
      rating: s.rating || 0,
    }));
  } catch {
    return [];
  }
}

async function fetchReviews(businessId: string): Promise<ReviewItem[]> {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data, error } = await supabase
      .from("reviews")
      .select("id, customer_name, customer_avatar, rating, comment, created_at")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) return [];

    return (data || []).map((r: any) => ({
      id: r.id,
      customerName: r.customer_name,
      customerAvatar: r.customer_avatar,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}

function generateMockAvailability(): DayAvailability[] {
  const days: DayAvailability[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    days.push({
      date,
      dayName: ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"][date.getDay() === 0 ? 6 : date.getDay() - 1],
      availableSlots: Math.floor(Math.random() * 8) + 2,
    });
  }
  
  return days;
}

export default async function BusinessPage({ params }: PageProps) {
  const business = await fetchBusiness(params.slug);
  
  if (!business) {
    notFound();
  }

  const [services, staff, reviews] = await Promise.all([
    fetchServices(business.id),
    fetchStaff(business.id),
    fetchReviews(business.id),
  ]);

  const availability = generateMockAvailability();

  // Calculate price range
  const prices = services.map((s) => s.priceMin);
  const priceMin = prices.length > 0 ? Math.min(...prices) : 0;
  const priceMax = prices.length > 0 ? Math.max(...services.map((s) => s.priceMax)) : 0;

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      <HeroSection business={business} />

      {business.description && (
        <section className="px-4 sm:px-6 py-6">
          <h2 className="text-xl font-semibold mb-3">Тайлбар</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{business.description}</p>
        </section>
      )}

      <GallerySection gallery={business.gallery} />

      <ServicesSection services={services} businessSlug={business.slug} />

      <StaffSection staff={staff} />

      <ReviewsSection
        reviews={reviews}
        avgRating={business.avgRating}
        reviewCount={business.reviewCount}
      />

      <AvailabilitySection
        availability={availability}
        onDaySelect={(date) => {
          // Scroll to booking or navigate
          console.log("Selected date:", date);
        }}
      />

      <MobileBottomBar
        priceMin={priceMin}
        priceMax={priceMax}
        businessSlug={business.slug}
      />
    </div>
  );
}
