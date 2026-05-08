import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { format, subDays } from "date-fns";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get business
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!business) {
      return NextResponse.json([]);
    }

    const stats = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayName = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"][date.getDay() === 0 ? 6 : date.getDay() - 1];

      const { count: bookings } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("business_id", business.id)
        .eq("booking_date", dateStr)
        .neq("status", "cancelled");

      const { data: revenue } = await supabase
        .from("bookings")
        .select("price")
        .eq("business_id", business.id)
        .eq("booking_date", dateStr)
        .eq("status", "completed");

      const totalRevenue = revenue?.reduce((sum, b) => sum + (b.price || 0), 0) || 0;

      stats.push({
        date: dayName,
        fullDate: dateStr,
        bookings: bookings || 0,
        revenue: totalRevenue,
      });
    }

    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
