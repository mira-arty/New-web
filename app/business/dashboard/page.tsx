"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardBooking, DashboardSummary, DashboardNotification, DashboardView } from "@/lib/types/dashboard";
import SummaryCards from "./components/SummaryCards";
import AppointmentTimeline from "./components/AppointmentTimeline";
import ViewToggle from "./components/ViewToggle";
import NotificationPanel from "./components/NotificationPanel";
import WeeklyStats from "./components/WeeklyStats";
import { useAuth } from "@/hooks/use-auth";

export default function BusinessDashboardPage() {
  const { user, profile } = useAuth();
  const [view, setView] = useState<DashboardView>("today");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [summary, setSummary] = useState<DashboardSummary>({
    todayBookings: 0,
    pendingConfirmations: 0,
    todayRevenue: 0,
    emptySlotsToday: 0,
  });
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoConfirm, setAutoConfirm] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch summary
      const summaryRes = await fetch("/api/business/dashboard/summary");
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      }

      // Fetch bookings based on view
      let bookingsUrl = `/api/business/dashboard/bookings?view=${view}`;
      if (view === "custom" && dateRange.start && dateRange.end) {
        bookingsUrl += `&start=${dateRange.start}&end=${dateRange.end}`;
      }
      
      const bookingsRes = await fetch(bookingsUrl);
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }

      // Fetch notifications
      const notifRes = await fetch("/api/business/dashboard/notifications");
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData);
      }

      // Fetch stats
      const statsRes = await fetch("/api/business/dashboard/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch settings
      const settingsRes = await fetch("/api/business/settings");
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setAutoConfirm(settingsData.autoConfirm || false);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }, [user, view, dateRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    // Setup Supabase Realtime subscription
    const setupRealtime = async () => {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const channel = supabase
          .channel("dashboard-updates")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "bookings" },
            (payload) => {
              // Refresh data when bookings change
              fetchDashboardData();
              
              // Add notification
              const newNotif: DashboardNotification = {
                id: `notif_${Date.now()}`,
                type: payload.eventType === "INSERT" ? "new_booking" : "cancellation",
                title: payload.eventType === "INSERT" ? "Шинэ цаг авалт" : "Цаг авалт өөрчлөгдлөө",
                message: payload.eventType === "INSERT" 
                  ? "Шинэ цаг авалт бүртгэгдлээ" 
                  : "Цаг авалтын төлөв өөрчлөгдлөө",
                timestamp: new Date().toISOString(),
                isRead: false,
                bookingId: (payload.new as any)?.id,
              };
              
              setNotifications((prev) => [newNotif, ...prev]);
            }
          )
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "reviews" },
            () => {
              const newNotif: DashboardNotification = {
                id: `notif_${Date.now()}`,
                type: "new_review",
                title: "Шинэ сэтгэгдэл",
                message: "Таны бизнесэд шинэ сэтгэгдэл бичлээ",
                timestamp: new Date().toISOString(),
                isRead: false,
              };
              setNotifications((prev) => [newNotif, ...prev]);
            }
          )
          .subscribe();

        return () => {
          channel.unsubscribe();
        };
      } catch (error) {
        console.error("Realtime setup error:", error);
      }
    };

    setupRealtime();
  }, [user, fetchDashboardData]);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/business/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: newStatus as any } : b
        )
      );
    } catch (error) {
      console.error("Status update error:", error);
      alert("Төлөв өөрчлөхөд алдаа гарлаа");
    }
  };

  const handleSendReminder = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/business/bookings/${bookingId}/reminder`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to send reminder");

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, hasReminderSent: true } : b
        )
      );
      
      alert("Сануулагч илгээгдлээ!");
    } catch (error) {
      console.error("Reminder error:", error);
      alert("Сануулагч илгээхэд алдаа гарлаа");
    }
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notifId ? { ...n, isRead: true } : n
      )
    );
  };

  const toggleAutoConfirm = async () => {
    try {
      const newValue = !autoConfirm;
      const res = await fetch("/api/business/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoConfirm: newValue }),
      });

      if (!res.ok) throw new Error("Failed to update settings");
      setAutoConfirm(newValue);
    } catch (error) {
      console.error("Settings error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Ачаалж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold">Самбар</h1>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <span>Автоматаар баталгаажуулах</span>
                <button
                  onClick={toggleAutoConfirm}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoConfirm ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoConfirm ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards */}
        <SummaryCards summary={summary} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <ViewToggle
              view={view}
              onViewChange={setView}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />

            <AppointmentTimeline
              bookings={bookings}
              view={view}
              onStatusChange={handleStatusChange}
              onSendReminder={handleSendReminder}
            />
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            <NotificationPanel
              notifications={notifications}
              onMarkRead={markNotificationRead}
            />
          </div>
        </div>

        {/* Weekly Stats */}
        <WeeklyStats stats={stats} />
      </div>
    </div>
  );
}
