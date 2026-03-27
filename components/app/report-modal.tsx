"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Flag } from "lucide-react";
import { reportSchema } from "@/lib/validations/schemas";
import { z } from "zod";
import { submitReport } from "@/app/actions/reports";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { ReportTargetType } from "@/lib/types/database";

const reasons = [
  { code: "harassment", label: "Harassment or bullying" },
  { code: "self_harm", label: "Self-harm or crisis concern" },
  { code: "sexual", label: "Sexual content or exploitation" },
  { code: "spam", label: "Spam or scams" },
  { code: "other", label: "Something else" },
];

const schema = reportSchema;
type FormValues = z.infer<typeof schema>;

export function ReportModal({
  targetType,
  targetId,
}: {
  targetType: ReportTargetType;
  targetId: string;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      targetType,
      targetId,
      reasonCode: "harassment",
      description: "",
    },
  });

  async function onSubmit(values: FormValues) {
    const res = await submitReport({
      targetType,
      targetId,
      reasonCode: values.reasonCode,
      description: values.description,
    });
    if (res.error) {
      toast({
        title: "Report not sent",
        description: typeof res.error === "string" ? res.error : "Try signing in again",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Thank you",
      description: "Moderators will review this quietly and carefully.",
    });
    setOpen(false);
    form.reset({
      targetType,
      targetId,
      reasonCode: values.reasonCode,
      description: "",
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Flag className="mr-1 h-3.5 w-3.5" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report to moderators</DialogTitle>
          <DialogDescription>
            Reports are confidential. We review with care—this is not emergency
            response.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reasonCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reasons.map((r) => (
                        <SelectItem key={r.code} value={r.code}>
                          {r.label}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Details (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Submit report
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
