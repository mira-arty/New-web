import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const {
      businessName,
      category,
      address,
      location,
      phone,
      profilePhoto,
      description,
      services,
      staff,
      businessHours,
      advanceBookingLimit,
      bufferTime,
      cancellationPolicy,
    } = body;

    // Start a transaction by using RPC
    // 1. Create business
    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .insert({
        owner_id: user.id,
        name: businessName,
        slug: `${slug}-${Date.now()}`,
        description: description || "",
        category: category,
        address: address,
        location: location
          ? `POINT(${location.lng} ${location.lat})`
          : null,
        phone: phone,
        logo_url: profilePhoto,
        is_active: true,
      })
      .select()
      .single();

    if (businessError) throw businessError;

    // 2. Create business hours
    if (businessHours?.length > 0) {
      const { error: hoursError } = await supabase
        .from("business_hours")
        .insert(
          businessHours.map((h: any) => ({
            business_id: business.id,
            day_of_week: h.day,
            open_time: h.isOpen ? h.openTime : null,
            close_time: h.isOpen ? h.closeTime : null,
            is_closed: !h.isOpen,
          }))
        );
      if (hoursError) throw hoursError;
    }

    // 3. Create services and map temp IDs to real IDs
    const serviceIdMap = new Map<string, string>();
    if (services?.length > 0) {
      const servicesData = services.map((s: any) => ({
        business_id: business.id,
        name: s.name,
        category: s.category || "",
        duration_minutes: s.duration,
        price_min: s.priceMin,
        price_max: s.priceMax || s.priceMin,
        is_active: true,
      }));

      const { data: createdServices, error: servicesError } = await supabase
        .from("services")
        .insert(servicesData)
        .select();

      if (servicesError) throw servicesError;

      // Map temp IDs
      services.forEach((s: any, index: number) => {
        if (createdServices?.[index]) {
          serviceIdMap.set(s.id, createdServices[index].id);
        }
      });
    }

    // 4. Create staff
    const staffIdMap = new Map<string, string>();
    if (staff?.length > 0) {
      const staffData = staff.map((s: any) => ({
        business_id: business.id,
        name: s.name,
        role: s.role || "",
        phone: s.phone || "",
        avatar_url: s.avatarUrl,
        is_active: true,
      }));

      const { data: createdStaff, error: staffError } = await supabase
        .from("staff")
        .insert(staffData)
        .select();

      if (staffError) throw staffError;

      staff.forEach((s: any, index: number) => {
        if (createdStaff?.[index]) {
          staffIdMap.set(s.id, createdStaff[index].id);
        }
      });

      // 5. Create staff-services relationships
      const staffServicesData: any[] = [];
      staff.forEach((s: any) => {
        const staffDbId = staffIdMap.get(s.id);
        if (!staffDbId) return;

        s.serviceIds.forEach((serviceTempId: string) => {
          const serviceDbId = serviceIdMap.get(serviceTempId);
          if (serviceDbId) {
            staffServicesData.push({
              staff_id: staffDbId,
              service_id: serviceDbId,
            });
          }
        });
      });

      if (staffServicesData.length > 0) {
        const { error: ssError } = await supabase
          .from("staff_services")
          .insert(staffServicesData);
        if (ssError) throw ssError;
      }

      // 6. Create staff availability
      const availabilityData: any[] = [];
      staff.forEach((s: any) => {
        const staffDbId = staffIdMap.get(s.id);
        if (!staffDbId) return;

        s.workSchedule.forEach((day: any) => {
          availabilityData.push({
            staff_id: staffDbId,
            day_of_week: day.day,
            start_time: day.isWorking ? day.startTime : null,
            end_time: day.isWorking ? day.endTime : null,
            is_working: day.isWorking,
          });
        });
      });

      if (availabilityData.length > 0) {
        const { error: availError } = await supabase
          .from("staff_availability")
          .insert(availabilityData);
        if (availError) throw availError;
      }
    }

    // Update profile role to business_owner if not already
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "business_owner" })
      .eq("id", user.id);

    if (profileError) throw profileError;

    return NextResponse.json({
      success: true,
      businessId: business.id,
      message: "Business created successfully",
    });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create business" },
      { status: 500 }
    );
  }
}
