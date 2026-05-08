import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get business owned by user
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!business) {
      return NextResponse.json({
        todayBookings: 0,
        pendingConfirmations: 0,
        todayRevenue: 0,
        emptySlotsToday: 0,
      });
    }

    const today = new Date().toISOString().split("T")[0];

    // Today's bookings
    const { count: todayBookings } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("business_id", business.id)
      .eq("booking_date", today)
      .neq("status", "cancelled");

    // Pending confirmations
    const { count: pendingConfirmations } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("business_id", business.id)
      .eq("status", "pending");

    // Today's revenue
    const { data: todayRevenueData } = await supabase
      .from("bookings")
      .select("price")
      .eq("business_id", business.id)
      .eq("booking_date", today)
      .eq("status", "completed");

    const todayRevenue = todayRevenueData?.reduce((sum, b) => sum + (b.price || 0), 0) || 0;

    // Calculate empty slots (simplified)
    const { data: businessHours } = await supabase
      .from("business_hours")
      .select("open_time, close_time, is_closed")
      .eq("business_id", business.id)
      .eq("day_of_week", new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)
      .single();

    let emptySlotsToday = 0;
    if (businessHours && !businessHours.is_closed) {
      const [openHour] = businessHours.open_time.split(":").map(Number);
      const [closeHour] = businessHours.close_time.split(":").map(Number);
      const totalSlots = (closeHour - openHour) * 2; // 30-min slots
      emptySlotsToday = Math.max(0, totalSlots - (todayBookings || 0));
    }

    return NextResponse.json({
      todayBookings: todayBookings || 0,
      pendingConfirmations: pendingConfirmations || 0,
      todayRevenue,
      emptySlotsToday,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
