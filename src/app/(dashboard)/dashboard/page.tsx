import { prisma } from "@/lib/prisma";
import { OverviewChart } from "@/components/dashboard/overview-chart";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];

export default async function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const startDate = new Date(`${currentYear}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${currentYear}-12-31T23:59:59.999Z`);

  const [totalExpenseResult, approvedExpenseResult, expenses] = await Promise.all([
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.expense.aggregate({ 
      _sum: { amount: true },
      where: { status: { in: ["APPROVED_FINANCE", "APPROVED_FOUNDER"] } }
    }),
    prisma.expense.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      select: { amount: true, date: true, status: true }
    }),
  ]);

  const totalPengajuan = totalExpenseResult._sum.amount || 0;
  const totalDisetujui = approvedExpenseResult._sum.amount || 0;
  
  // Proses data chart
  const monthlyData = MONTHS.map((month) => ({
    name: month,
    Pengajuan: 0,
    Disetujui: 0,
  }));

  expenses.forEach((item) => {
    const monthIndex = new Date(item.date).getMonth();
    monthlyData[monthIndex].Pengajuan += Number(item.amount);
    if (item.status === "APPROVED_FINANCE" || item.status === "APPROVED_FOUNDER") {
      monthlyData[monthIndex].Disetujui += Number(item.amount);
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600">Selamat datang di Sistem Pengajuan Modal.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm ring-1 ring-zinc-900/5 sm:p-6 border-l-4 border-blue-500">
          <dt className="truncate text-sm font-medium text-zinc-500">Total Pengajuan (Semua Status)</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            Rp {Number(totalPengajuan).toLocaleString("id-ID")}
          </dd>
        </div>
        <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm ring-1 ring-zinc-900/5 sm:p-6 border-l-4 border-green-500">
          <dt className="truncate text-sm font-medium text-zinc-500">Total Disetujui</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            Rp {Number(totalDisetujui).toLocaleString("id-ID")}
          </dd>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-zinc-900/5 overflow-hidden">
        <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
          <h2 className="text-lg font-medium text-zinc-900">Grafik Pengajuan {currentYear}</h2>
        </div>
        <div className="p-6">
          <OverviewChart data={monthlyData} />
        </div>
      </div>
    </div>
  );
}
