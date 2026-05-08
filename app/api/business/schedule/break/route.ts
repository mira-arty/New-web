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
    const { staffId, date, startTime, endTime, label } = body;

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

    // Create staff exception for break
    const { error } = await supabase.from("staff_exceptions").insert({
      staff_id: staffId,
      exception_date: date,
      is_full_day: false,
      start_time: startTime,
      end_time: endTime,
      reason: label || "Break",
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add break" },
      { status: 500 }
    );
  }
}
