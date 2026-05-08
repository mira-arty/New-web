import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, phone, role } = await request.json();

    const supabase = createRouteHandlerClient({ cookies });
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          role,
        },
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Update profile with additional data
    if (authData.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone,
          role,
        })
        .eq("id", authData.user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
      }
    }

    return NextResponse.json({
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
      },
      message: "Бүртгэл амжилттай",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Бүртгүүлэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
