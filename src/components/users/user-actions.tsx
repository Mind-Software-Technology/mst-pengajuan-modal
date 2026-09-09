"use client";

import { useState, useEffect } from "react";
import { deleteUser } from "@/server/actions/user.action";
import { Button } from "@/components/ui/button";
import { UserFormDialog } from "./user-form";
import { MoreHorizontal, Pencil, Trash2, Lock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserActions({ user }: { user: any }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("mst_team_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentUserId(parsed.userId || "");
        setIsSuperAdmin(parsed.role === "SUPER_ADMIN");
      } catch (e) {}
    }
  }, []);

  const isSelf = currentUserId === user.id;

  async function handleDelete() {
    if (!confirm(`Yakin ingin menghapus pengguna ${user.name}?`)) return;
    setIsDeleting(true);
    const res = await deleteUser(user.id, currentUserId);
    setIsDeleting(false);
    if (res.error) {
      alert(res.error);
    }
  }

  // Jika bukan diri sendiri dan bukan Super Admin yang bisa menghapus, kunci akses
  if (!isSelf && !isSuperAdmin) {
    return (
      <span className="text-[11px] text-zinc-400 italic px-2 inline-flex items-center gap-1" title="Hanya profil sendiri yang dapat diedit">
        <Lock className="h-3 w-3 text-zinc-300" />
      </span>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* HANYA DIRI SENDIRI YANG BISA EDIT PROFIL */}
          {isSelf && (
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Profil Saya
            </DropdownMenuItem>
          )}
          {/* HANYA SUPER ADMIN YANG BISA HAPUS (tidak bisa hapus akun diri sendiri dari sini) */}
          {isSuperAdmin && !isSelf && (
            <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-600 focus:text-red-600">
              <Trash2 className="mr-2 h-4 w-4" /> Hapus Pengguna
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isSelf && (
        <UserFormDialog 
          user={user} 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen} 
          trigger={null} 
        />
      )}
    </>
  );
}
