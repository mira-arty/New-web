import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_date,
        start_time,
        price,
        status,
        businesses (name),
        services (name),
        staff (name)
      `)
      .eq("id", params.id)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: booking.id,
      businessName: booking.businesses?.[0]?.name,
      serviceName: booking.services?.[0]?.name,
      staffName: booking.staff?.[0]?.name,
      date: booking.booking_date,
      time: booking.start_time,
      price: booking.price,
      status: booking.status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch booking" },
      { status: 500 }
    );
  }
}
