"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<"customer" | "business_owner">("customer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Нууц үг таарахгүй байна");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName,
          phone,
          role,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Бүртгэл амжилтгүй");
      }

      // Auto-login after registration
      const loginRes = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) throw new Error("Нэвтрэх амжилтгүй");

      // Redirect based on role
      if (role === "business_owner") {
        router.push("/business/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Бүртгэл амжилтгүй");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      value: "customer" as const,
      title: "Үйлчлүүлэгч",
      description: "Үйлчилгээ хайх, цаг авах",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      value: "business_owner" as const,
      title: "Бизнес эзэмшигч",
      description: "Бизнесээ бүртгүүлэх, удирдах",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Timer.mn</h1>
          <p className="text-gray-600 mt-2">Бүртгүүлэх</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-4">
            <p className="text-center text-gray-700 font-medium">Та хэн бэ?</p>
            <div className="grid grid-cols-2 gap-4">
              {roles.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`p-6 rounded-xl border-2 text-center transition-all ${
                    role === r.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`mx-auto mb-3 ${role === r.value ? "text-blue-600" : "text-gray-400"}`}>
                    {r.icon}
                  </div>
                  <h3 className="font-semibold">{r.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{r.description}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Үргэлжлүүлэх
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Буцах
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
              {role === "customer" ? "Үйлчлүүлэгч" : "Бизнес эзэмшигч"} хувьд бүртгүүлж байна
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Бүтэн нэр
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Бат Эрдэнэ"
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Утасны дугаар
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+976 9911 2233"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Нууц үг
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Хамгийн багадаа 8 тэмдэгт"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Нууц үг баталгаажуулах
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Нууц үгээ дахин оруулна уу"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Бүртгэж байна..." : "Бүртгүүлэх"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600">
          Бүртгэлтэй юу?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
            Нэвтрэх
          </Link>
        </p>
      </div>
    </div>
  );
}
