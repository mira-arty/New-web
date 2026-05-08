// Timer.mn — SMS Service
// Unitel SMS API integration with fallback to console.log for development

interface SMSConfig {
  apiKey: string;
  apiSecret: string;
  senderId: string;
  baseUrl: string;
}

interface SMSLogEntry {
  id: string;
  phone: string;
  message: string;
  status: "sent" | "failed" | "pending";
  error?: string;
  createdAt: string;
}

// Format phone number to +976XXXXXXXX format
export function formatMongolianPhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");
  
  // If starts with 976, add +
  if (digits.startsWith("976")) {
    return `+${digits}`;
  }
  
  // If starts with 0, replace with +976
  if (digits.startsWith("0")) {
    return `+976${digits.slice(1)}`;
  }
  
  // If 8 digits, add +976 prefix
  if (digits.length === 8) {
    return `+976${digits}`;
  }
  
  // Already formatted
  return digits.startsWith("+") ? digits : `+${digits}`;
}

// Validate Mongolian phone number
export function isValidMongolianPhone(phone: string): boolean {
  const formatted = formatMongolianPhone(phone);
  // +976 followed by 8 digits
  return /^\+976\d{8}$/.test(formatted);
}

// Send SMS via Unitel API
export async function sendSMS(
  phone: string,
  message: string,
  options?: { logToDatabase?: boolean }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const formattedPhone = formatMongolianPhone(phone);
  
  if (!isValidMongolianPhone(formattedPhone)) {
    console.error(`[SMS] Invalid phone number: ${phone}`);
    return { success: false, error: "Invalid phone number" };
  }

  // Check if SMS credentials are configured
  const config: SMSConfig = {
    apiKey: process.env.SMS_API_KEY || "",
    apiSecret: process.env.SMS_API_SECRET || "",
    senderId: process.env.SMS_SENDER_ID || "TimerMN",
    baseUrl: process.env.SMS_API_URL || "https://api.unitel.mn/sms",
  };

  const hasCredentials = config.apiKey && config.apiSecret;

  try {
    if (!hasCredentials) {
      // Development mode: log to console
      console.log("=".repeat(60));
      console.log("[SMS] DEVELOPMENT MODE - SMS would be sent:");
      console.log(`  To: ${formattedPhone}`);
      console.log(`  Message: ${message}`);
      console.log(`  Sender: ${config.senderId}`);
      console.log("=".repeat(60));
      
      // Still log to database if requested
      if (options?.logToDatabase) {
        await logSMS(formattedPhone, message, "sent");
      }
      
      return { success: true, messageId: `mock_${Date.now()}` };
    }

    // Production: Call Unitel API
    const response = await fetch(config.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        to: formattedPhone,
        message,
        from: config.senderId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Unitel API error: ${error}`);
    }

    const data = await response.json();
    
    console.log(`[SMS] Sent to ${formattedPhone}: ${message}`);
    
    // Log to database
    if (options?.logToDatabase) {
      await logSMS(formattedPhone, message, "sent", data.messageId);
    }
    
    return { success: true, messageId: data.messageId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[SMS] Failed to send to ${formattedPhone}:`, errorMessage);
    
    // Log failure
    if (options?.logToDatabase) {
      await logSMS(formattedPhone, message, "failed", undefined, errorMessage);
    }
    
    return { success: false, error: errorMessage };
  }
}

// Log SMS to database
async function logSMS(
  phone: string,
  message: string,
  status: "sent" | "failed" | "pending",
  messageId?: string,
  error?: string
): Promise<void> {
  try {
    // This would be called via API in production
    // For now, just log to console
    console.log(`[SMS Log] ${status}: ${phone} - ${message.substring(0, 50)}...`);
  } catch (err) {
    console.error("[SMS] Failed to log SMS:", err);
  }
}

// SMS Templates
export const smsTemplates = {
  // 1. Customer books → confirmation
  bookingConfirmation: (params: {
    customerName: string;
    businessName: string;
    date: string;
    time: string;
    bookingId: string;
  }): string => {
    return `Сайн байна уу, ${params.customerName}! Таны захиалга хүлээн авлаа. ${params.businessName}, ${params.date} ${params.time}. Захиалгын дугаар: #${params.bookingId.slice(0, 8)}. Timer.mn`;
  },

  // 2. Business confirms → confirmation
  bookingConfirmed: (params: {
    customerName: string;
    businessName: string;
    date: string;
    time: string;
  }): string => {
    return `Сайн байна уу, ${params.customerName}! Таны захиалга баталгаажлаа. ${params.businessName} тантай уулзахыг хүлээж байна! ${params.date} ${params.time}. Timer.mn`;
  },

  // 3. 1 hour before appointment → reminder
  appointmentReminder: (params: {
    customerName: string;
    businessName: string;
    time: string;
  }): string => {
    return `Сануулга: 1 цагийн дараа ${params.businessName}-д таны цаг байна. ${params.time}. Timer.mn`;
  },

  // 4. Customer cancels → notification to business
  bookingCancelled: (params: {
    customerName: string;
    businessName: string;
    date: string;
    time: string;
    serviceName: string;
  }): string => {
    return `${params.customerName} захиалгаа цуцаллаа. ${params.businessName}, ${params.date} ${params.time}, ${params.serviceName}. Timer.mn`;
  },

  // 5. Booking completed → thank you + review request
  bookingCompleted: (params: {
    customerName: string;
    businessName: string;
  }): string => {
    return `Баярлалаа, ${params.customerName}! ${params.businessName}-д үйлчлүүлсэнд баярлалаа. Таны сэтгэгдлийг хүлээж байна. Timer.mn`;
  },
};

// Send booking confirmation SMS
export async function sendBookingConfirmationSMS(params: {
  customerPhone: string;
  customerName: string;
  businessName: string;
  date: string;
  time: string;
  bookingId: string;
}): Promise<{ success: boolean }> {
  const message = smsTemplates.bookingConfirmation(params);
  const result = await sendSMS(params.customerPhone, message, { logToDatabase: true });
  return { success: result.success };
}

// Send booking confirmed SMS
export async function sendBookingConfirmedSMS(params: {
  customerPhone: string;
  customerName: string;
  businessName: string;
  date: string;
  time: string;
}): Promise<{ success: boolean }> {
  const message = smsTemplates.bookingConfirmed(params);
  const result = await sendSMS(params.customerPhone, message, { logToDatabase: true });
  return { success: result.success };
}

// Send appointment reminder SMS
export async function sendAppointmentReminderSMS(params: {
  customerPhone: string;
  customerName: string;
  businessName: string;
  time: string;
}): Promise<{ success: boolean }> {
  const message = smsTemplates.appointmentReminder(params);
  const result = await sendSMS(params.customerPhone, message, { logToDatabase: true });
  return { success: result.success };
}

// Send cancellation SMS to business
export async function sendCancellationToBusinessSMS(params: {
  businessPhone: string;
  customerName: string;
  businessName: string;
  date: string;
  time: string;
  serviceName: string;
}): Promise<{ success: boolean }> {
  const message = smsTemplates.bookingCancelled(params);
  const result = await sendSMS(params.businessPhone, message, { logToDatabase: true });
  return { success: result.success };
}

// Send completion SMS
export async function sendCompletionSMS(params: {
  customerPhone: string;
  customerName: string;
  businessName: string;
}): Promise<{ success: boolean }> {
  const message = smsTemplates.bookingCompleted(params);
  const result = await sendSMS(params.customerPhone, message, { logToDatabase: true });
  return { success: result.success };
}
