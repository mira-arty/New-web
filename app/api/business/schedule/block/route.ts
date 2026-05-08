import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { staffId, date, startTime, endTime, reason } = body;

    // Verify ownership
    const { data: staff } = await supabase
      .from("staff")
      .select("business_id")
      .eq("id", staffId)
      .single();

    if (!staff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("owner_id")
      .eq("id", staff.business_id)
      .single();

    if (!business || business.owner_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create as a booking with blocked status
    const { error } = await supabase.from("bookings").insert({
      business_id: staff.business_id,
      customer_id: user.id,
      staff_id: staffId,
      service_id: null,
      booking_date: date,
      start_time: startTime,
      end_time: endTime,
      status: "cancelled",
      customer_notes: reason || "Blocked time",
      price: 0,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to block time" },
      { status: 500 }
    );
  }
}
