"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { commentSchema } from "@/lib/validations/schemas";
import { z } from "zod";
import { createComment } from "@/app/actions/comments";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const schema = commentSchema;
type FormValues = z.infer<typeof schema>;

export function CommentComposer({ postId }: { postId: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { postId, body: "" },
  });

  async function onSubmit(values: FormValues) {
    const res = await createComment(values);
    if (res.error) {
      toast({
        title: "Could not comment",
        description: typeof res.error === "string" ? res.error : "Try again",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Thank you for listening" });
    form.reset({ postId, body: "" });
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Add a supportive reply</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Respond with care…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          Comment
        </Button>
      </form>
    </Form>
  );
}
