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
      .from("staff")
      .select("id, name, role, avatar_url, specialties, rating")
      .eq("business_id", params.id)
      .eq("is_active", true);

    if (error) throw error;

    return NextResponse.json(
      (data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        role: s.role || "Мастер",
        avatarUrl: s.avatar_url,
        specialties: s.specialties || [],
        rating: s.rating || 0,
      }))
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch staff" },
      { status: 500 }
    );
  }
}
