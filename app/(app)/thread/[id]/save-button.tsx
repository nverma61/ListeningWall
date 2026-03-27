"use client";

import { Bookmark } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toggleSavedPost } from "@/app/actions/saved";
import { useToast } from "@/hooks/use-toast";

export function SavePostButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-full"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const res = await toggleSavedPost(postId);
        setLoading(false);
        if ("error" in res && res.error) {
          toast({ title: "Could not save", description: res.error, variant: "destructive" });
          return;
        }
        toast({
          title: res.saved ? "Saved" : "Removed",
          description: res.saved
            ? "You can find saved posts in Settings."
            : "Removed from saved.",
        });
      }}
    >
      <Bookmark className="mr-1 h-3.5 w-3.5" />
      Save
    </Button>
  );
}
