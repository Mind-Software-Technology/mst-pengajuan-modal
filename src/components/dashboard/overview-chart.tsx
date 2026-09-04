"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";

interface OverviewChartProps {
  data: {
    name: string;
    Pengajuan: number;
    Disetujui: number;
  }[];
}

export function OverviewChart({ data }: OverviewChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
        <XAxis
          dataKey="name"
          stroke="#71717a"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#71717a"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `Rp ${value / 1000000}M`}
        />
        <Tooltip 
          formatter={(value: number) => [`Rp ${value.toLocaleString("id-ID")}`, ""]}
          cursor={{ fill: "#f4f4f5" }}
          contentStyle={{ borderRadius: "8px", border: "1px solid #e4e4e7" }}
        />
        <Legend />
        <Bar dataKey="Pengajuan" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Disetujui" fill="#22c55e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
