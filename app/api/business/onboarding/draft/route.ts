import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const DRAFT_TABLE = "business_onboarding_drafts";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();

    // Upsert draft
    const { error } = await supabase
      .from(DRAFT_TABLE)
      .upsert({
        user_id: user.id,
        data: body,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      });

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Draft saved" });
  } catch (error: any) {
    console.error("Draft save error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save draft" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from(DRAFT_TABLE)
      .select("data")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows

    return NextResponse.json({ draft: data?.data || null });
  } catch (error: any) {
    console.error("Draft load error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load draft" },
      { status: 500 }
    );
  }
}
