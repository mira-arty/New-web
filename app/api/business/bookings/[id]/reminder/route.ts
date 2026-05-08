import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify ownership
    const { data: booking } = await supabase
      .from("bookings")
      .select("business_id")
      .eq("id", params.id)
      .single();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("owner_id")
      .eq("id", booking.business_id)
      .single();

    if (!business || business.owner_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update reminder sent status
    const { error } = await supabase
      .from("bookings")
      .update({ has_reminder_sent: true })
      .eq("id", params.id);

    if (error) throw error;

    // In a real implementation, send SMS here
    // await sendSMS(booking.customer_phone, "Your appointment is tomorrow at...");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to send reminder" },
      { status: 500 }
    );
  }
}
