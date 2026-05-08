import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;
  const isAuthenticated = !!session;

  // Get user profile for role-based checks
  let userRole = null;
  if (session) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();
    userRole = profile?.role;
  }

  // Auth routes: redirect away if already logged in
  if (pathname.startsWith("/auth")) {
    if (isAuthenticated) {
      // Redirect based on role
      if (userRole === "business_owner") {
        return NextResponse.redirect(new URL("/business/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
    return res;
  }

  // Business routes: require business_owner role
  if (pathname.startsWith("/business")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    if (userRole !== "business_owner") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return res;
  }

  // Profile routes: require any authenticated user
  if (pathname.startsWith("/profile")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return res;
  }

  // Onboarding: require auth
  if (pathname === "/onboarding") {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return res;
  }

  return res;
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/business/:path*",
    "/profile/:path*",
    "/onboarding",
  ],
};
