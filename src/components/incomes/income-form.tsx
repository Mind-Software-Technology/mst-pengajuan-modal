"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { incomeSchema, IncomeInput } from "@/server/dto/income.dto";
import { createIncome, updateIncome } from "@/server/actions/income.action";
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

export function IncomeFormDialog({ 
  income,
  projects,
  open: externalOpen,
  onOpenChange: setExternalOpen,
  trigger
}: { 
  income?: any,
  projects: Project[],
  open?: boolean,
  onOpenChange?: (open: boolean) => void,
  trigger?: React.ReactNode
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = setExternalOpen || setInternalOpen;
  
  const form = useForm<IncomeInput>({
    resolver: zodResolver(incomeSchema) as any,
    defaultValues: {
      title: income?.title || "",
      amount: income ? Number(income.amount) : 0,
      date: income?.date ? new Date(income.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      projectId: income?.projectId || "",
      source: income?.source || "",
      description: income?.description || "",
    },
  });

  async function onSubmit(data: IncomeInput) {
    const res = income
      ? await updateIncome(income.id, data)
      : await createIncome(data);
      
    if (res.error) {
      alert(res.error);
    } else {
      if (!income) form.reset();
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <DialogTrigger render={(trigger as React.ReactElement) || (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Catat Pemasukan
          </Button>
        )} />
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{income ? "Edit Pemasukan" : "Catat Pemasukan Baru"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Pemasukan</FormLabel>
                  <FormControl>
                    <Input placeholder="Pembayaran Termin 1 XYZ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Pemasukan"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
