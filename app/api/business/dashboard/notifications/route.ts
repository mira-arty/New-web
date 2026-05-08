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

    // Get business
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!business) {
      return NextResponse.json([]);
    }

    // Get recent bookings as notifications
    const { data: recentBookings } = await supabase
      .from("bookings")
      .select("id, status, created_at, profiles (full_name), services (name)")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const notifications = (recentBookings || []).map((b: any) => {
      const isNew = new Date(b.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      return {
        id: `booking_${b.id}`,
        type: b.status === "cancelled" ? "cancellation" : "new_booking",
        title: b.status === "cancelled" ? "Цаг авалт цуцлагдлаа" : "Шинэ цаг авалт",
        message: `${b.profiles?.full_name || "Үйлчлүүлэгч"} - ${b.services?.name || "Үйлчилгээ"}`,
        timestamp: b.created_at,
        isRead: !isNew,
        bookingId: b.id,
      };
    });

    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
