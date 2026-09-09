"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, UserInput } from "@/server/dto/user.dto";
import { createUser, updateUser } from "@/server/actions/user.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function UserFormDialog({ 
  user,
  open: externalOpen,
  onOpenChange: setExternalOpen,
  trigger
}: { 
  user?: any,
  open?: boolean,
  onOpenChange?: (open: boolean) => void,
  trigger?: React.ReactNode
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = setExternalOpen || setInternalOpen;
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
  
  const form = useForm<UserInput>({
    resolver: zodResolver(userSchema) as any,
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "TEAM_MEMBER",
      password: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: user?.name || "",
        email: user?.email || "",
        role: user?.role || "TEAM_MEMBER",
        password: "",
      });
    }
  }, [open, user, form]);

  const isSelf = user && currentUserId === user.id;

  async function onSubmit(data: UserInput) {
    const payload = { ...data };
    if (!payload.password) {
      delete payload.password;
    }
    const res = user
      ? await updateUser(user.id, payload, currentUserId)
      : await createUser(payload);
      
    if (res.error) {
      alert(res.error);
    } else {
      // Jika memperbarui profil sendiri, perbarui data di sessionStorage
      if (isSelf && res.data) {
        const saved = sessionStorage.getItem("mst_team_session");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            parsed.personName = res.data.name;
            parsed.email = res.data.email;
            sessionStorage.setItem("mst_team_session", JSON.stringify(parsed));
            window.dispatchEvent(new Event("mst_session_updated"));
          } catch (e) {}
        }
      }
      if (!user) form.reset();
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <DialogTrigger render={(trigger as React.ReactElement) || (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Tambah Karyawan
          </Button>
        )} />
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {user ? (isSelf ? "Edit Profil Saya" : "Edit Karyawan / Pengguna") : "Tambah Karyawan / Pengguna"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@mst.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>Jabatan (Role)</span>
                    {!isSuperAdmin && user && (
                      <span className="text-[10px] text-zinc-400 font-normal">Dikelola Super Admin</span>
                    )}
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!isSuperAdmin && !!user}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Role">
                          {(val: any) => {
                            if (!val) return "Pilih Role";
                            const m: any = { SUPER_ADMIN: "Super Admin", FOUNDER: "Founder", FINANCE_MANAGER: "Finance Manager", PROJECT_MANAGER: "Project Manager", TEAM_MEMBER: "Team Member" };
                            return m[val] || val;
                          }}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SUPER_ADMIN">Super Admin (Founder)</SelectItem>
                      <SelectItem value="FINANCE">Finance (Keuangan)</SelectItem>
                      <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                      <SelectItem value="TEAM_MEMBER">Team Member (Staff)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Baru (Opsional)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={user ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Menyimpan..." : (isSelf ? "Simpan Perubahan Profil" : "Simpan Pengguna")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
