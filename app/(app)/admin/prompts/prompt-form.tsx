"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { promptAdminSchema } from "@/lib/validations/schemas";
import { z } from "zod";
import { upsertPrompt } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

type FormValues = z.infer<typeof promptAdminSchema>;

export function PromptAdminForm() {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(promptAdminSchema),
    defaultValues: {
      promptText: "",
      slug: "",
      audience: "shared",
      activeDate: "",
      isPublished: true,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await upsertPrompt({
        ...values,
        activeDate: values.activeDate || null,
      });
      toast({ title: "Saved prompt" });
      form.reset();
    } catch (e) {
      toast({
        title: "Could not save",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border p-6">
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (URL)</FormLabel>
              <FormControl>
                <Input placeholder="gentle-check-in" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="promptText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt text</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="audience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Audience</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="teens">Teens</SelectItem>
                  <SelectItem value="parents">Parents</SelectItem>
                  <SelectItem value="shared">Shared</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="activeDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Active date (YYYY-MM-DD)</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(c) => field.onChange(c === true)}
                />
              </FormControl>
              <FormLabel className="!mt-0">Published</FormLabel>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Save prompt
        </Button>
      </form>
    </Form>
  );
}
