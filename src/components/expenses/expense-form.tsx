"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, ExpenseInput } from "@/server/dto/expense.dto";
import { createExpense, updateExpense } from "@/server/actions/expense.action";
import { createUser } from "@/server/actions/user.action";
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

type Project = { id: string; name: string };
type User = { id: string; name: string };

export function ExpenseFormDialog({ 
  expense,
  projects,
  users,
  open: externalOpen,
  onOpenChange: setExternalOpen,
  trigger
}: { 
  expense?: any,
  projects: Project[],
  users: User[],
  open?: boolean,
  onOpenChange?: (open: boolean) => void,
  trigger?: React.ReactNode
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = setExternalOpen || setInternalOpen;
  
  const [localUsers, setLocalUsers] = useState<User[]>(users);
  
  const [showNewUser, setShowNewUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  
  const form = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      title: expense?.title || "",
      amount: expense ? Number(expense.amount) : 0,
      date: expense?.date ? new Date(expense.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      projectId: expense?.projectId || "",
      category: expense?.category || "",
      description: expense?.description || "",
      submittedById: expense?.submitterId || expense?.submittedById || users[0]?.id || "",
    },
  });

  async function onSubmit(data: ExpenseInput) {
    const res = expense
      ? await updateExpense(expense.id, data)
      : await createExpense(data);
      
    if (res.error) {
      alert(res.error);
    } else {
      if (!expense) form.reset();
      setOpen(false);
    }
  }

  async function handleCreateUser() {
    if (!newUserName || !newUserEmail) return alert("Nama dan Email wajib diisi");
    setIsCreatingUser(true);
    const res = await createUser({ name: newUserName, email: newUserEmail, role: "TEAM_MEMBER" as any });
    setIsCreatingUser(false);
    if (res.error) {
      alert(res.error);
    } else if (res.data) {
      const newUser = { id: res.data.id, name: res.data.name };
      setLocalUsers([...localUsers, newUser]);
      form.setValue("submittedById", newUser.id);
      setShowNewUser(false);
      setNewUserName("");
      setNewUserEmail("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <DialogTrigger render={(trigger as React.ReactElement) || (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Ajukan Modal
          </Button>
        )} />
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Pengajuan" : "Buat Pengajuan Baru"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Pengajuan</FormLabel>
                  <FormControl>
                    <Input placeholder="Keperluan Modal..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah (Rp)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kategori">
                          {(val: any) => {
                            if (!val) return "Pilih Kategori";
                            const m: any = { OPERATIONAL: "Operasional", PROJECT: "Proyek", MARKETING: "Marketing", SALARY: "Gaji/Payroll", OTHER: "Lain-lain" };
                            return m[val] || val;
                          }}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="OPERATIONAL">Operasional</SelectItem>
                      <SelectItem value="PROJECT">Proyek</SelectItem>
                      <SelectItem value="MARKETING">Marketing</SelectItem>
                      <SelectItem value="SALARY">Gaji/Payroll</SelectItem>
                      <SelectItem value="OTHER">Lain-lain</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Removed project field */}
            <FormField
              control={form.control}
              name="submittedById"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Pengaju</FormLabel>
                    {!showNewUser && (
                      <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={() => setShowNewUser(true)}>
                        + Tambah Baru
                      </Button>
                    )}
                  </div>
                  {showNewUser ? (
                    <div className="space-y-2 border p-3 rounded-md bg-zinc-50">
                      <Input 
                        placeholder="Nama Lengkap" 
                        value={newUserName} 
                        onChange={(e) => setNewUserName(e.target.value)} 
                        disabled={isCreatingUser}
                      />
                      <Input 
                        placeholder="Email" 
                        type="email" 
                        value={newUserEmail} 
                        onChange={(e) => setNewUserEmail(e.target.value)} 
                        disabled={isCreatingUser}
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewUser(false)} disabled={isCreatingUser}>
                          Batal
                        </Button>
                        <Button type="button" size="sm" onClick={handleCreateUser} disabled={isCreatingUser}>
                          {isCreatingUser ? "Menyimpan..." : "Simpan & Pilih"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Pengaju">
                            {(val: any) => {
                              if (!val) return "Pilih Pengaju";
                              const u = localUsers.find((u) => u.id === val);
                              return u ? u.name : val;
                            }}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {localUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Pengajuan"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
