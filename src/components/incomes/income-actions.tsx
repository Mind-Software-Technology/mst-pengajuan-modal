"use client";

import { useState } from "react";
import { deleteIncome } from "@/server/actions/income.action";
import { Button } from "@/components/ui/button";
import { IncomeFormDialog } from "./income-form";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function IncomeActions({ income, projects }: { income: any, projects: any[] }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus pemasukan ini?")) return;
    setIsDeleting(true);
    const res = await deleteIncome(income.id);
    setIsDeleting(false);
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
          <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-600 focus:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" /> Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <IncomeFormDialog 
        income={income} 
        projects={projects}
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        trigger={null} 
      />
    </>
  );
}
