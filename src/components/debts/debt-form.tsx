"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { debtSchema, DebtInput } from "@/server/dto/debt.dto";
import { createDebt, updateDebt } from "@/server/actions/debt.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export function DebtFormDialog({ 
  debt,
  projects,
  users,
  open: externalOpen,
  onOpenChange: setExternalOpen,
  trigger
}: { 
  debt?: any,
  projects: Project[],
  users: User[],
  open?: boolean,
  onOpenChange?: (open: boolean) => void,
  trigger?: React.ReactNode
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = setExternalOpen || setInternalOpen;
  
  const form = useForm<DebtInput>({
    resolver: zodResolver(debtSchema) as any,
    defaultValues: {
      title: debt?.title || "",
      amount: debt ? Number(debt.amount) : 0,
      date: debt?.date ? new Date(debt.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      projectId: debt?.projectId || "",
      description: debt?.description || "",
      receiptUrl: debt?.receiptUrl || "",
      submitterId: debt?.submitterId || users[0]?.id || "",
    },
  });

  async function onSubmit(data: DebtInput) {
    const res = debt
      ? await updateDebt(debt.id, data)
      : await createDebt(data);
      
    if (res.error) {
      alert(res.error);
    } else {
      if (!debt) form.reset();
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <DialogTrigger render={(trigger as React.ReactElement) || (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Ajukan Utang (Reimburse)
          </Button>
        )} />
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{debt ? "Edit Pengajuan Utang" : "Pengajuan Utang / Reimburse"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan / Keperluan</FormLabel>
                  <FormControl>
                    <Input placeholder="Pembelian Tinta Printer" {...field} />
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
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terkait Proyek (Opsional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Proyek (Opsional)">
                          {(val: any) => {
                            if (!val) return "Tidak ada proyek khusus";
                            const p = projects.find((p) => p.id === val);
                            return p ? p.name : val;
                          }}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Tidak ada proyek khusus</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="submitterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Pengaju</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Pengaju">
                          {(val: any) => {
                            if (!val) return "Pilih Pengaju";
                            const u = users.find((u) => u.id === val);
                            return u ? u.name : val;
                          }}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="receiptUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bukti / Struk (URL atau Link Google Drive)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan Tambahan</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Keterangan lebih lanjut jika perlu..." {...field} />
                  </FormControl>
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
