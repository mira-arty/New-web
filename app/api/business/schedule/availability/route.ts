import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { staffId, workingDays, startTime, endTime, breaks } = body;

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

    // Update staff availability
    // First delete existing
    await supabase
      .from("staff_availability")
      .delete()
      .eq("staff_id", staffId);

    // Insert new availability
    const availabilityData = workingDays.map((isWorking: boolean, index: number) => ({
      staff_id: staffId,
      day_of_week: index,
      start_time: isWorking ? startTime : null,
      end_time: isWorking ? endTime : null,
      is_working: isWorking,
    }));

    const { error: availError } = await supabase
      .from("staff_availability")
      .insert(availabilityData);

    if (availError) throw availError;

    // Update breaks
    await supabase
      .from("staff_breaks")
      .delete()
      .eq("staff_id", staffId);

    if (breaks?.length > 0) {
      const breaksData = breaks.map((b: any) => ({
        staff_id: staffId,
        day_of_week: b.dayOfWeek,
        start_time: b.startTime,
        end_time: b.endTime,
        label: b.label,
      }));

      const { error: breakError } = await supabase
        .from("staff_breaks")
        .insert(breaksData);

      if (breakError) throw breakError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update availability" },
      { status: 500 }
    );
  }
}
