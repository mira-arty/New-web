import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data, error } = await supabase
      .from("services")
      .select("id, name, category, duration_minutes, price_min, price_max, is_active")
      .eq("business_id", params.id)
      .eq("is_active", true)
      .order("category");

    if (error) throw error;

    return NextResponse.json(
      (data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        category: s.category || "Бусад",
        duration: s.duration_minutes,
        price: s.price_max > s.price_min ? s.price_min : s.price_min,
      }))
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch services" },
      { status: 500 }
    );
  }
}
