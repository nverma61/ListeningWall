"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, HandHeart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleReaction } from "@/app/actions/reactions";
import { createClient } from "@/lib/supabase/client";
import type { ReactionType } from "@/lib/types/database";
import { useToast } from "@/hooks/use-toast";

const config: Record<
  ReactionType,
  { label: string; icon: typeof Heart }
> = {
  relate: { label: "I relate", icon: Sparkles },
  thank_you: { label: "Thank you for sharing", icon: Heart },
  helpful: { label: "Helpful", icon: HandHeart },
};

async function fetchMyReactions(postId?: string, commentId?: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [] as ReactionType[];
  const { data: prof } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!prof) return [];
  let q = supabase
    .from("reactions")
    .select("reaction_type")
    .eq("user_profile_id", prof.id);
  if (postId) q = q.eq("post_id", postId).is("comment_id", null);
  if (commentId) q = q.eq("comment_id", commentId).is("post_id", null);
  const { data } = await q;
  return (data ?? []).map((r) => r.reaction_type as ReactionType);
}

export function ReactionBar({
  postId,
  commentId,
  counts,
}: {
  postId?: string;
  commentId?: string;
  counts?: Partial<Record<ReactionType, number>>;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const qk = ["reactions", postId ?? "", commentId ?? ""] as const;

  const { data: mine = [] } = useQuery({
    queryKey: qk,
    queryFn: () => fetchMyReactions(postId, commentId),
  });

  const mutation = useMutation({
    mutationFn: async (type: ReactionType) => {
      const res = await toggleReaction({
        postId: postId ?? null,
        commentId: commentId ?? null,
        reactionType: type,
      });
      if (typeof res.error === "string") {
        throw new Error(res.error);
      }
      if (res.error) {
        throw new Error("Could not update reaction");
      }
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk });
      qc.invalidateQueries({ queryKey: ["thread", postId] });
    },
    onError: (e: Error) => {
      toast({
        title: "Could not update",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(config) as ReactionType[]).map((type) => {
        const { label, icon: Icon } = config[type];
        const active = mine.includes(type);
        const count = counts?.[type] ?? 0;
        return (
          <Button
            key={type}
            type="button"
            variant={active ? "default" : "secondary"}
            size="sm"
            className="rounded-full"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(type)}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="max-w-[10rem] truncate sm:max-w-none">{label}</span>
            {count > 0 ? (
              <span className="ml-1 rounded-full bg-background/20 px-1.5 text-xs">
                {count}
              </span>
            ) : null}
          </Button>
        );
      })}
    </div>
  );
}
