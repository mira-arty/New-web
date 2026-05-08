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
      .from("businesses")
      .select("id, name, slug, category, description, address, phone, cover_url, logo_url, avg_rating, review_count")
      .eq("id", params.id)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
      slug: data.slug,
      category: data.category,
      description: data.description,
      address: data.address,
      phone: data.phone,
      coverUrl: data.cover_url,
      logoUrl: data.logo_url,
      avgRating: data.avg_rating,
      reviewCount: data.review_count,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch business" },
      { status: 500 }
    );
  }
}
