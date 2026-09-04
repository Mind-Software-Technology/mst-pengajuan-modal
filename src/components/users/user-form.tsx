"use client";

import { useState } from "react";
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
  
  const form = useForm<UserInput>({
    resolver: zodResolver(userSchema) as any,
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "TEAM_MEMBER",
      password: "", // We might not want to edit password here simply
    },
  });

  async function onSubmit(data: UserInput) {
    const payload = { ...data };
    if (!payload.password) {
      delete payload.password;
    }
    const res = user
      ? await updateUser(user.id, payload)
      : await createUser(payload);
      
    if (res.error) {
      alert(res.error);
    } else {
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
          <DialogTitle>{user ? "Edit Karyawan / Pengguna" : "Tambah Karyawan / Pengguna"}</DialogTitle>
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
                  <FormLabel>Jabatan (Role)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
                  <FormLabel>Password (Opsional)</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Pengguna"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
