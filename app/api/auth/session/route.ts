import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ user: null, profile: null });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
      },
      profile,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Session check failed" },
      { status: 500 }
    );
  }
}
