export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-48 rounded bg-[#E5E5E8]" />
        <div className="h-10 w-40 rounded-md bg-[#E5E5E8]" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-[#E5E5E8] bg-white p-5 h-[100px]" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg border border-[#E5E5E8] bg-white h-64" />
        <div className="rounded-lg border border-[#E5E5E8] bg-white h-64" />
      </div>
    </div>
  );
}
