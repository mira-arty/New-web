import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { sendBookingConfirmedSMS, sendCancellationToBusinessSMS, sendCompletionSMS } from "@/lib/sms";
import { format } from "date-fns";
import { mn } from "date-fns/locale";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { status: newStatus } = await request.json();
    const bookingId = params.id;

    // Get current booking details
    const { data: booking } = await supabase
      .from("bookings")
      .select(`
        business_id,
        customer_id,
        staff_id,
        service_id,
        booking_date,
        start_time,
        status,
        profiles (full_name, phone),
        businesses (name, owner_id, phone),
        services (name)
      `)
      .eq("id", bookingId)
      .single();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify ownership
    if (booking.businesses?.[0]?.owner_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update status
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) throw error;

    // Send SMS notifications based on status change
    const customerPhone = booking.profiles?.[0]?.phone;
    const customerName = booking.profiles?.[0]?.full_name || "Үйлчлүүлэгч";
    const businessName = booking.businesses?.[0]?.name || "Бизнес";
    const businessPhone = booking.businesses?.[0]?.phone;
    const serviceName = booking.services?.[0]?.name || "Үйлчилгээ";
    const formattedDate = format(new Date(booking.booking_date), "yyyy.MM.dd", { locale: mn });
    const time = booking.start_time;

    // 1. Business confirms → SMS to customer
    if (newStatus === "confirmed" && booking.status !== "confirmed") {
      if (customerPhone) {
        await sendBookingConfirmedSMS({
          customerPhone,
          customerName,
          businessName,
          date: formattedDate,
          time,
        });
      }
    }

    // 2. Customer cancels → SMS to business owner
    if (newStatus === "cancelled" && booking.status !== "cancelled") {
      if (businessPhone) {
        await sendCancellationToBusinessSMS({
          businessPhone,
          customerName,
          businessName,
          date: formattedDate,
          time,
          serviceName,
        });
      }
    }

    // 3. Booking completed → SMS to customer (thank you)
    if (newStatus === "completed" && booking.status !== "completed") {
      if (customerPhone) {
        await sendCompletionSMS({
          customerPhone,
          customerName,
          businessName,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update status" },
      { status: 500 }
    );
  }
}
