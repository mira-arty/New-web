import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { sendBookingConfirmationSMS } from "@/lib/sms";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const {
      businessId,
      serviceId,
      staffId,
      date,
      time,
      notes,
      paymentMethod,
    } = body;

    // Get service details for price and duration
    const { data: service } = await supabase
      .from("services")
      .select("price_min, duration_minutes")
      .eq("id", serviceId)
      .single();

    // Get business name
    const { data: business } = await supabase
      .from("businesses")
      .select("name, auto_confirm")
      .eq("id", businessId)
      .single();

    // Get customer profile for phone
    const { data: customerProfile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .single();

    // Calculate end time
    const [hour, minute] = time.split(":").map(Number);
    const endMinutes = minute + (service?.duration_minutes || 60);
    const endHour = hour + Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    const endTime = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;

    // Determine status (auto-confirm if enabled)
    const status = business?.auto_confirm ? "confirmed" : "pending";

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        business_id: businessId,
        customer_id: user.id,
        staff_id: staffId,
        service_id: serviceId,
        booking_date: date,
        start_time: time,
        end_time: endTime,
        status,
        customer_notes: notes,
        price: service?.price_min || 0,
        payment_method: paymentMethod,
        payment_status: paymentMethod === "venue" ? "pending" : "pending",
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Send SMS confirmation to customer
    if (customerProfile?.phone) {
      const { format } = await import("date-fns");
      const { mn } = await import("date-fns/locale");
      
      await sendBookingConfirmationSMS({
        customerPhone: customerProfile.phone,
        customerName: customerProfile.full_name || "Үйлчлүүлэгч",
        businessName: business?.name || "Бизнес",
        date: format(new Date(date), "yyyy.MM.dd", { locale: mn }),
        time: time,
        bookingId: booking.id,
      });

      // If auto-confirmed, also send confirmation SMS
      if (status === "confirmed") {
        const { sendBookingConfirmedSMS } = await import("@/lib/sms");
        await sendBookingConfirmedSMS({
          customerPhone: customerProfile.phone,
          customerName: customerProfile.full_name || "Үйлчлүүлэгч",
          businessName: business?.name || "Бизнес",
          date: format(new Date(date), "yyyy.MM.dd", { locale: mn }),
          time: time,
        });
      }
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      status,
      autoConfirmed: business?.auto_confirm || false,
    });
  } catch (error: any) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}
