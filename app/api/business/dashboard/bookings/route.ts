import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

export async function GET(request: NextRequest) {
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
      return NextResponse.json({ bookings: [] });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "today";

    let startDate: string;
    let endDate: string;

    const today = format(new Date(), "yyyy-MM-dd");

    switch (view) {
      case "week":
        startDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
        endDate = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
        break;
      case "custom":
        startDate = searchParams.get("start") || today;
        endDate = searchParams.get("end") || today;
        break;
      default:
        startDate = today;
        endDate = today;
    }

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`
        id,
        start_time,
        status,
        price,
        customer_notes,
        has_reminder_sent,
        profiles (full_name, phone),
        services (name),
        staff (name)
      `)
      .eq("business_id", business.id)
      .gte("booking_date", startDate)
      .lte("booking_date", endDate)
      .order("start_time", { ascending: true });

    if (error) throw error;

    const formatted = (bookings || []).map((b: any) => ({
      id: b.id,
      time: b.start_time,
      customerName: b.profiles?.full_name || "Нэргүй",
      customerPhone: b.profiles?.phone || "",
      serviceName: b.services?.name || "Үйлчилгээ",
      staffName: b.staff?.name || null,
      status: b.status,
      price: b.price || 0,
      hasReminderSent: b.has_reminder_sent || false,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
