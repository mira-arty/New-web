import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get business owned by user
    const { data: business, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("owner_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    if (!business) {
      // Return empty profile structure
      return NextResponse.json({
        id: "",
        name: "",
        slug: "",
        description: "",
        coverUrl: null,
        logoUrl: null,
        gallery: [],
        tags: [],
        highlights: [],
        socialLinks: { instagram: "", facebook: "", tiktok: "" },
        category: "",
        address: "",
        phone: "",
        avgRating: 0,
        reviewCount: 0,
      });
    }

    return NextResponse.json({
      id: business.id,
      name: business.name,
      slug: business.slug,
      description: business.description || "",
      coverUrl: business.cover_url,
      logoUrl: business.logo_url,
      gallery: business.gallery || [],
      tags: business.tags || [],
      highlights: business.highlights || [],
      socialLinks: business.social_links || { instagram: "", facebook: "", tiktok: "" },
      category: business.category,
      address: business.address,
      phone: business.phone || "",
      avgRating: business.avg_rating || 0,
      reviewCount: business.review_count || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      coverUrl,
      logoUrl,
      gallery,
      tags,
      highlights,
      socialLinks,
    } = body;

    // Check if business exists
    const { data: existing } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from("businesses")
        .update({
          name,
          slug,
          description,
          cover_url: coverUrl,
          logo_url: logoUrl,
          gallery,
          tags,
          highlights,
          social_links: socialLinks,
        })
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      // Create new
      const { error } = await supabase.from("businesses").insert({
        owner_id: user.id,
        name,
        slug,
        description,
        cover_url: coverUrl,
        logo_url: logoUrl,
        gallery,
        tags,
        highlights,
        social_links: socialLinks,
        category: "other",
        address: "",
        is_active: true,
      });

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to save profile" },
      { status: 500 }
    );
  }
}
