import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { phone, token } = await request.json();

    const supabase = createRouteHandlerClient({ cookies });
    
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user?.id)
      .single();

    return NextResponse.json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
      profile,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "OTP verification failed" },
      { status: 500 }
    );
  }
}
