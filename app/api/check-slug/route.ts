import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    // Check if slug exists
    const { data, error } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", slug)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return NextResponse.json({
      available: !data,
      slug,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to check slug" },
      { status: 500 }
    );
  }
}
