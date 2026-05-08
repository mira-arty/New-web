"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("И-мэйл илгээхэд алдаа гарлаа");
      
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Timer.mn</h1>
          <p className="text-gray-600 mt-2">Нууц үг сэргээх</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-6 rounded-lg text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="font-semibold text-lg mb-2">И-мэйл илгээгдлээ!</h3>
            <p className="text-sm">
              {email} хаяг руу нууц үг сэргээх заавар илгээлээ. И-мэйлээ шалгана уу.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600">
              Бүртгэлтэй и-мэйл хаягаа оруулна уу. Нууц үг сэргээх холбоосыг илгээх болно.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                И-мэйл
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Илгээж байна..." : "Илгээх"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600">
          <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
            Нэвтрэх хуудас руу буцах
          </Link>
        </p>
      </div>
    </div>
  );
}
