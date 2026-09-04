"use client";

import { useState } from "react";
import { deleteExpense, updateExpenseStatus } from "@/server/actions/expense.action";
import { Button } from "@/components/ui/button";
import { ExpenseFormDialog } from "./expense-form";
import { MoreHorizontal, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ExpenseActions({ expense, projects, users }: { expense: any, projects: any[], users: any[] }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus pengajuan ini?")) return;
    setIsDeleting(true);
    const res = await deleteExpense(expense.id);
    setIsDeleting(false);
    if (res.error) {
      alert(res.error);
    }
  }

  async function handleUpdateStatus(status: "APPROVED_FINANCE" | "REJECTED") {
    if (!confirm(`Yakin ingin ${status === "APPROVED_FINANCE" ? "menyetujui" : "menolak"} pengajuan ini?`)) return;
    const res = await updateExpenseStatus(expense.id, status);
    if (res.error) {
      alert(res.error);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          {expense.status === "PENDING" && (
            <>
              <DropdownMenuItem onClick={() => handleUpdateStatus("APPROVED_FINANCE")} className="text-green-600 focus:text-green-600">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Setujui
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdateStatus("REJECTED")} className="text-orange-600 focus:text-orange-600">
                <XCircle className="mr-2 h-4 w-4" /> Tolak
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-600 focus:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" /> Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExpenseFormDialog 
        expense={expense} 
        projects={projects}
        users={users}
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        trigger={null} 
      />
    </>
  );
}
