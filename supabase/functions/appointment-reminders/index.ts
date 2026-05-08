// Supabase Edge Function: Appointment Reminders
// Runs every 30 minutes to send SMS reminders 1 hour before appointments

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface Booking {
  id: string;
  customer_phone: string;
  customer_name: string;
  business_name: string;
  start_time: string;
  booking_date: string;
}

// Format Mongolian phone number
function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("976")) return `+${digits}`;
  if (digits.startsWith("0")) return `+976${digits.slice(1)}`;
  if (digits.length === 8) return `+976${digits}`;
  return digits.startsWith("+") ? digits : `+${digits}`;
}

// Mock SMS sender (replace with actual Unitel API call)
async function sendSMS(phone: string, message: string): Promise<boolean> {
  const formattedPhone = formatPhone(phone);
  
  console.log("=".repeat(60));
  console.log("[SMS REMINDER] Sending SMS:");
  console.log(`  To: ${formattedPhone}`);
  console.log(`  Message: ${message}`);
  console.log("=".repeat(60));
  
  // TODO: Replace with actual Unitel API call
  // const response = await fetch("https://api.unitel.mn/sms", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "Authorization": `Bearer ${Deno.env.get("SMS_API_KEY")}`,
  //   },
  //   body: JSON.stringify({
  //     to: formattedPhone,
  //     message,
  //     from: "TimerMN",
  //   }),
  // });
  // return response.ok;
  
  return true;
}

// Main handler
Deno.serve(async (req) => {
  try {
    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get upcoming appointments (1-1.5 hours from now)
    const { data: bookings, error } = await supabase.rpc("check_upcoming_appointments");
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log(`[Reminder] Found ${bookings?.length || 0} upcoming appointments`);
    
    const results = [];
    
    for (const booking of (bookings || [])) {
      try {
        // Send reminder SMS
        const message = `Сануулга: 1 цагийн дараа ${booking.business_name}-д таны цаг байна. ${booking.start_time}. Timer.mn`;
        
        const sent = await sendSMS(booking.customer_phone, message);
        
        if (sent) {
          // Mark reminder as sent
          const { error: updateError } = await supabase
            .from("bookings")
            .update({ has_reminder_sent: true })
            .eq("id", booking.booking_id);
          
          if (updateError) {
            console.error(`[Reminder] Failed to mark reminder sent for ${booking.booking_id}:`, updateError);
          }
          
          // Log SMS
          await supabase.from("sms_logs").insert({
            phone: formatPhone(booking.customer_phone),
            message,
            status: "sent",
            booking_id: booking.booking_id,
          });
          
          results.push({
            bookingId: booking.booking_id,
            status: "sent",
            phone: formatPhone(booking.customer_phone),
          });
        }
      } catch (err) {
        console.error(`[Reminder] Error processing booking ${booking.booking_id}:`, err);
        results.push({
          bookingId: booking.booking_id,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[Reminder] Edge function error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
