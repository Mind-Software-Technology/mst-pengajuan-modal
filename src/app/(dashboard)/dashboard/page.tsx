import { prisma } from "@/lib/prisma";
import { getDashboardStats } from "@/server/actions/expense.action";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, users] = await Promise.all([
    getDashboardStats(),
    prisma.user.findMany({ select: { id: true, name: true } }),
  ]);

  return <DashboardClient initialStats={stats} users={users} />;
}
