"use client";

import { useState } from "react";
import { deleteUser } from "@/server/actions/user.action";
import { Button } from "@/components/ui/button";
import { UserFormDialog } from "./user-form";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserActions({ user }: { user: any }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus pengguna ini?")) return;
    setIsDeleting(true);
    const res = await deleteUser(user.id);
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

      <UserFormDialog 
        user={user} 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        trigger={null} 
      />
    </>
  );
}
