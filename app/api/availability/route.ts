import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");
    const serviceId = searchParams.get("serviceId");
    const staffId = searchParams.get("staffId");
    const date = searchParams.get("date");

    if (!businessId || !serviceId || !date) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get service duration
    const { data: service } = await supabase
      .from("services")
      .select("duration_minutes")
      .eq("id", serviceId)
      .single();

    const duration = service?.duration_minutes || 60;

    // Get business hours for the day
    const dayOfWeek = new Date(date).getDay();
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const { data: hours } = await supabase
      .from("business_hours")
      .select("open_time, close_time, is_closed")
      .eq("business_id", businessId)
      .eq("day_of_week", adjustedDay)
      .single();

    if (!hours || hours.is_closed) {
      return NextResponse.json({ slots: [] });
    }

    // Get existing bookings for the date
    let bookingsQuery = supabase
      .from("bookings")
      .select("start_time, end_time, staff_id")
      .eq("business_id", businessId)
      .eq("booking_date", date)
      .neq("status", "cancelled");

    if (staffId) {
      bookingsQuery = bookingsQuery.eq("staff_id", staffId);
    }

    const { data: bookings } = await bookingsQuery;

    // Generate time slots (30-minute intervals)
    const slots: { time: string; isAvailable: boolean }[] = [];
    const slotInterval = 30;

    const [openHour, openMinute] = hours.open_time.split(":").map(Number);
    const [closeHour, closeMinute] = hours.close_time.split(":").map(Number);

    let currentHour = openHour;
    let currentMinute = openMinute;

    while (
      currentHour < closeHour ||
      (currentHour === closeHour && currentMinute < closeMinute)
    ) {
      const timeStr = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;

      // Calculate end time
      const endMinutes = currentMinute + duration;
      const endHour = currentHour + Math.floor(endMinutes / 60);
      const endMinute = endMinutes % 60;
      const endTimeStr = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;

      // Check if slot fits within business hours
      const fitsInHours =
        endHour < closeHour ||
        (endHour === closeHour && endMinute <= closeMinute);

      // Check for conflicts with existing bookings
      let isAvailable = fitsInHours;

      if (isAvailable && bookings) {
        for (const booking of bookings) {
          const bookingStart = booking.start_time;
          const bookingEnd = booking.end_time;

          // Check overlap
          if (
            (timeStr >= bookingStart && timeStr < bookingEnd) ||
            (endTimeStr > bookingStart && endTimeStr <= bookingEnd) ||
            (timeStr <= bookingStart && endTimeStr >= bookingEnd)
          ) {
            isAvailable = false;
            break;
          }
        }
      }

      slots.push({ time: timeStr, isAvailable });

      // Next slot
      currentMinute += slotInterval;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute -= 60;
      }
    }

    return NextResponse.json({ slots });
  } catch (error: any) {
    console.error("Availability error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
