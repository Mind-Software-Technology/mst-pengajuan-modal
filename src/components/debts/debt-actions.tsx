"use client";

import { useState } from "react";
import { deleteDebt, updateDebtStatus } from "@/server/actions/debt.action";
import { Button } from "@/components/ui/button";
import { DebtFormDialog } from "./debt-form";
import { MoreHorizontal, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function DebtActions({ debt, projects, users }: { debt: any, projects: any[], users: any[] }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus catatan utang ini?")) return;
    setIsDeleting(true);
    const res = await deleteDebt(debt.id);
    setIsDeleting(false);
    if (res.error) {
      alert(res.error);
    }
  }

  async function handleStatusChange(status: "PENDING" | "APPROVED" | "REJECTED" | "PAID") {
    const res = await updateDebtStatus(debt.id, status);
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
          
          <DropdownMenuSeparator />
          
          {debt.status === "PENDING" && (
            <>
              <DropdownMenuItem onClick={() => handleStatusChange("APPROVED")} className="text-blue-600 focus:text-blue-600">
                <CheckCircle className="mr-2 h-4 w-4" /> Setujui
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("REJECTED")} className="text-orange-600 focus:text-orange-600">
                <XCircle className="mr-2 h-4 w-4" /> Tolak
              </DropdownMenuItem>
            </>
          )}
          
          {debt.status === "APPROVED" && (
            <DropdownMenuItem onClick={() => handleStatusChange("PAID")} className="text-green-600 focus:text-green-600">
              <CheckCircle className="mr-2 h-4 w-4" /> Tandai Dibayar
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-600 focus:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" /> Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DebtFormDialog 
        debt={debt} 
        projects={projects}
        users={users}
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        trigger={null} 
      />
    </>
  );
}
