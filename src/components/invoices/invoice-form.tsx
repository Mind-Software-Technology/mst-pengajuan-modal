"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, InvoiceInput } from "@/server/dto/invoice.dto";
import { createInvoice, updateInvoice } from "@/server/actions/invoice.action";
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

export function InvoiceFormDialog({ 
  invoice,
  projects,
  open: externalOpen,
  onOpenChange: setExternalOpen,
  trigger
}: { 
  invoice?: any,
  projects: Project[],
  open?: boolean,
  onOpenChange?: (open: boolean) => void,
  trigger?: React.ReactNode
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = setExternalOpen || setInternalOpen;
  
  const form = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      invoiceNumber: invoice?.invoiceNumber || "",
      projectId: invoice?.projectId || "",
      amount: invoice ? Number(invoice.amount) : 0,
      dueDate: invoice?.dueDate ? new Date(invoice.dueDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      status: invoice?.status || "PENDING",
      pdfUrl: invoice?.pdfUrl || "",
    },
  });

  async function onSubmit(data: InvoiceInput) {
    const res = invoice
      ? await updateInvoice(invoice.id, data)
      : await createInvoice(data);
      
    if (res.error) {
      alert(res.error);
    } else {
      if (!invoice) form.reset();
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <DialogTrigger render={(trigger as React.ReactElement) || (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Buat Invoice
          </Button>
        )} />
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{invoice ? "Edit Invoice" : "Buat Invoice Baru"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Invoice</FormLabel>
                  <FormControl>
                    <Input placeholder="INV-2026-001" {...field} />
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
                  <FormLabel>Proyek</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Proyek">
                          {(val: any) => {
                            if (!val) return "Pilih Proyek";
                            const p = projects.find((p) => p.id === val);
                            return p ? p.name : val;
                          }}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jatuh Tempo</FormLabel>
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Status">
                          {(val: any) => {
                            if (!val) return "Pilih Status";
                            const m: any = { DRAFT: "Draft", SENT: "Dikirim", PAID: "Dibayar", OVERDUE: "Jatuh Tempo", CANCELLED: "Dibatalkan" };
                            return m[val] || val;
                          }}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="OVERDUE">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Invoice"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
