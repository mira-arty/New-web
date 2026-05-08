import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "47.8864");
    const lng = parseFloat(searchParams.get("lng") || "106.9057");
    const radius = parseInt(searchParams.get("radius") || "5000");
    const category = searchParams.get("category");
    const minRating = parseFloat(searchParams.get("minRating") || "0");
    const openNow = searchParams.get("openNow") === "true";
    const query = searchParams.get("query") || "";

    // Build the query with PostGIS
    let dbQuery = supabase
      .from("businesses")
      .select(`
        id, name, slug, category, address, location, phone,
        cover_url, logo_url, avg_rating, review_count,
        business_hours (day_of_week, open_time, close_time, is_closed)
      `)
      .eq("is_active", true);

    // PostGIS distance filter
    const { data: businesses, error } = await dbQuery;

    if (error) throw error;

    if (!businesses) {
      return NextResponse.json({ businesses: [] });
    }

    // Calculate distances and filter
    let processedBusinesses = businesses.map((business: any) => {
      // Extract lat/lng from PostGIS point
      let businessLat = lat;
      let businessLng = lng;
      
      if (business.location) {
        // Parse POINT(lng lat) format
        const match = business.location.match(/POINT\(([^\s]+)\s+([^\s]+)\)/);
        if (match) {
          businessLng = parseFloat(match[1]);
          businessLat = parseFloat(match[2]);
        }
      }

      // Calculate distance using Haversine formula
      const R = 6371000; // Earth's radius in meters
      const dLat = (businessLat - lat) * Math.PI / 180;
      const dLng = (businessLng - lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat * Math.PI / 180) * Math.cos(businessLat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      // Check if open now
      const now = new Date();
      const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1; // Convert to 0=Monday
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      
      const todayHours = business.business_hours?.find(
        (h: any) => h.day_of_week === currentDay
      );
      
      const isOpen = todayHours && !todayHours.is_closed &&
        currentTime >= todayHours.open_time &&
        currentTime <= todayHours.close_time;

      return {
        id: business.id,
        name: business.name,
        slug: business.slug,
        category: business.category,
        address: business.address,
        location: { lat: businessLat, lng: businessLng },
        phone: business.phone,
        coverUrl: business.cover_url,
        logoUrl: business.logo_url,
        avgRating: business.avg_rating || 0,
        reviewCount: business.review_count || 0,
        distance,
        isOpen,
        businessHours: business.business_hours || [],
      };
    });

    // Apply filters
    processedBusinesses = processedBusinesses.filter((b: any) => {
      if (b.distance > radius) return false;
      if (category && category !== "all" && b.category !== category) return false;
      if (minRating > 0 && b.avgRating < minRating) return false;
      if (openNow && !b.isOpen) return false;
      if (query && !b.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });

    // Sort by distance
    processedBusinesses.sort((a: any, b: any) => a.distance - b.distance);

    return NextResponse.json({ businesses: processedBusinesses });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: error.message || "Search failed" },
      { status: 500 }
    );
  }
}
