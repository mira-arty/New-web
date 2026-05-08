"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WeeklyStatsProps {
  stats: any[];
}

export default function WeeklyStats({ stats }: WeeklyStatsProps) {
  // Mock data if no stats provided
  const data = stats.length > 0 ? stats : [
    { date: "Да", bookings: 5, revenue: 150000 },
    { date: "Мя", bookings: 8, revenue: 240000 },
    { date: "Лх", bookings: 12, revenue: 360000 },
    { date: "Пү", bookings: 7, revenue: 210000 },
    { date: "Ба", bookings: 10, revenue: 300000 },
    { date: "Бя", bookings: 15, revenue: 450000 },
    { date: "Ня", bookings: 6, revenue: 180000 },
  ];

  const totalBookings = data.reduce((sum, d) => sum + d.bookings, 0);
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Сүүлийн 7 хоног</h2>
          <p className="text-sm text-gray-500">Цаг авалт & орлого</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{totalBookings} цаг</p>
          <p className="text-lg text-green-600 font-semibold">{totalRevenue.toLocaleString()}₮</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis 
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "12px",
              }}
              formatter={(value: number, name: string) => {
                if (name === "revenue") return [`${value.toLocaleString()}₮`, "Орлого"];
                return [value, "Цаг авалт"];
              }}
            />
            <Bar 
              dataKey="bookings" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
              name="bookings"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
        <div className="text-center">
          <p className="text-sm text-gray-500">Нийт цаг</p>
          <p className="text-xl font-bold">{totalBookings}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Нийт орлого</p>
          <p className="text-xl font-bold">{totalRevenue.toLocaleString()}₮</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Дундаж</p>
          <p className="text-xl font-bold">
            {totalBookings > 0 ? Math.round(totalRevenue / totalBookings).toLocaleString() : 0}₮
          </p>
        </div>
      </div>
    </div>
  );
}
