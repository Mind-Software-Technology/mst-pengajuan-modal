import { getExpenses } from "@/server/actions/expense.action";
import { prisma } from "@/lib/prisma";
import { ExpenseFormDialog } from "@/components/expenses/expense-form";
import { ExpenseActions } from "@/components/expenses/expense-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ExpensesPage() {
  const { data: expenses } = await getExpenses();
  const users = await prisma.user.findMany({ select: { id: true, name: true } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daftar Pengajuan Modal</h1>
          <p className="text-sm text-zinc-500">
            Kelola data pengajuan modal kebutuhan.
          </p>
        </div>
        <ExpenseFormDialog projects={[]} users={users} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Judul Kebutuhan</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Pengaju</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-zinc-500">
                    Belum ada data pengajuan.
                  </TableCell>
                </TableRow>
              ) : (
                expenses?.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {new Date(expense.date).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell className="font-medium">{expense.title}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{expense.submitter.name}</TableCell>
                    <TableCell>
                      <Badge variant={expense.status === "APPROVED_FINANCE" || expense.status === "APPROVED_FOUNDER" ? "default" : "secondary"}>
                        {expense.status === "PENDING" ? "Menunggu Persetujuan" : (expense.status === "REJECTED" ? "Ditolak" : "Disetujui")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-blue-600 font-semibold">
                      Rp {Number(expense.amount).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <ExpenseActions 
                        expense={{
                          ...expense,
                          amount: Number(expense.amount),
                          project: undefined,
                          submitter: undefined
                        }} 
                        projects={[]} 
                        users={users} 
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
