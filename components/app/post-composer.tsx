"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { postSchema } from "@/lib/validations/schemas";
import { z } from "zod";
import { createPost } from "@/app/actions/posts";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Topic, Prompt, PromptSuggestionWithAuthor } from "@/lib/types/database";

const formSchema = postSchema;

type FormValues = z.infer<typeof formSchema>;

export type PostComposerAudienceBehavior =
  | { kind: "locked"; audience: "teens" | "parents" }
  | { kind: "staff" };

export type DefaultPromptLink =
  | { kind: "official"; id: string }
  | { kind: "community"; id: string }
  | null;

function defaultPromptFields(link: DefaultPromptLink) {
  if (!link) {
    return { promptId: null as string | null, promptSuggestionId: null as string | null };
  }
  if (link.kind === "official") {
    return { promptId: link.id, promptSuggestionId: null as string | null };
  }
  return { promptId: null as string | null, promptSuggestionId: link.id };
}

function truncateForSelect(text: string, max = 80) {
  const s = text.trim().replace(/\s+/g, " ");
  if (s.length <= max) return s;
  return `${s.slice(0, max).trim()}…`;
}

export function PostComposer({
  defaultAudience,
  topics,
  officialPrompts,
  communitySuggestions,
  defaultPromptLink = null,
  audienceBehavior,
  heading = "Share a reflection",
  subheading = "Your username is visible; your email is not.",
}: {
  defaultAudience: "teens" | "parents";
  topics: Topic[];
  officialPrompts: Prompt[];
  communitySuggestions: PromptSuggestionWithAuthor[];
  defaultPromptLink?: DefaultPromptLink;
  audienceBehavior: PostComposerAudienceBehavior;
  heading?: string;
  subheading?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const initialAudience =
    audienceBehavior.kind === "locked"
      ? audienceBehavior.audience
      : defaultAudience;

  const initialPrompt = defaultPromptFields(defaultPromptLink);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      body: "",
      audience: initialAudience,
      topicId: null,
      promptId: initialPrompt.promptId,
      promptSuggestionId: initialPrompt.promptSuggestionId,
    },
  });

  const showPromptPicker =
    officialPrompts.length > 0 || communitySuggestions.length > 0;

  const linkSelectValue = (() => {
    const sid = form.watch("promptSuggestionId");
    const pid = form.watch("promptId");
    if (sid) return `c:${sid}`;
    if (pid) return `o:${pid}`;
    return "none";
  })();

  React.useEffect(() => {
    if (audienceBehavior.kind === "locked") {
      form.setValue("audience", audienceBehavior.audience);
    }
  }, [audienceBehavior, form]);

  async function onSubmit(values: FormValues) {
    const res = await createPost(values);
    if ("error" in res && res.error) {
      if (typeof res.error === "string") {
        toast({ title: "Could not post", description: res.error, variant: "destructive" });
      } else {
        toast({
          title: "Check the form",
          description: "Some fields need attention.",
          variant: "destructive",
        });
      }
      return;
    }
    if ("id" in res && res.id) {
      toast({ title: "Shared with care", description: "Your reflection is live." });
      const nextPrompt = defaultPromptFields(defaultPromptLink);
      form.reset({
        title: "",
        body: "",
        audience:
          audienceBehavior.kind === "locked"
            ? audienceBehavior.audience
            : values.audience,
        topicId: null,
        promptId: nextPrompt.promptId,
        promptSuggestionId: nextPrompt.promptSuggestionId,
      });
      router.push(`/thread/${res.id}`);
      router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 rounded-2xl border bg-card p-4 shadow-soft sm:p-6"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-lg font-semibold">{heading}</h2>
            <p className="text-sm text-muted-foreground">{subheading}</p>
          </div>
        </div>
        {audienceBehavior.kind === "locked" ? (
          <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
            <p className="text-sm font-medium text-foreground">Posting as</p>
            <p className="text-sm text-muted-foreground">
              {audienceBehavior.audience === "parents"
                ? "Parent voice — your post appears in the parents column on The Wall."
                : "Teen voice — your post appears in the teens column on The Wall."}
            </p>
          </div>
        ) : (
          <FormField
            control={form.control}
            name="audience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Post on The Wall as</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="teens">Teen voice</SelectItem>
                    <SelectItem value="parents">Parent voice</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="topicId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topic (optional)</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                value={field.value ?? "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="General" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">General</SelectItem>
                  {topics.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {showPromptPicker ? (
          <FormField
            control={form.control}
            name="promptId"
            render={() => (
              <FormItem>
                <FormLabel>Link to a prompt (optional)</FormLabel>
                <Select
                  value={linkSelectValue}
                  onValueChange={(v) => {
                    if (v === "none") {
                      form.setValue("promptId", null);
                      form.setValue("promptSuggestionId", null);
                    } else if (v.startsWith("o:")) {
                      form.setValue("promptId", v.slice(2));
                      form.setValue("promptSuggestionId", null);
                    } else if (v.startsWith("c:")) {
                      form.setValue("promptSuggestionId", v.slice(2));
                      form.setValue("promptId", null);
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[min(24rem,var(--radix-select-content-available-height))]">
                    <SelectItem value="none">None</SelectItem>
                    {officialPrompts.length > 0 ? (
                      <SelectGroup>
                        <SelectLabel>Official prompts</SelectLabel>
                        {officialPrompts.map((p) => (
                          <SelectItem
                            key={p.id}
                            value={`o:${p.id}`}
                            title={p.prompt_text}
                          >
                            {truncateForSelect(p.prompt_text)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ) : null}
                    {communitySuggestions.length > 0 ? (
                      <SelectGroup>
                        <SelectLabel>Community prompt ideas</SelectLabel>
                        {communitySuggestions.map((s) => (
                          <SelectItem
                            key={s.id}
                            value={`c:${s.id}`}
                            title={s.suggestion_text}
                          >
                            {truncateForSelect(s.suggestion_text)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ) : null}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title (optional)</FormLabel>
              <FormControl>
                <Input placeholder="A gentle headline" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your words</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write honestly. You are not alone here."
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          Post
        </Button>
      </form>
    </Form>
  );
}
