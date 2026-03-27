"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { blockUser } from "@/app/actions/blocks";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function BlockButton({ blockedProfileId }: { blockedProfileId: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={loading}
      className="rounded-full"
      onClick={async () => {
        setLoading(true);
        const res = await blockUser({ blockedProfileId });
        setLoading(false);
        if (res.error) {
          toast({
            title: "Could not block",
            description: typeof res.error === "string" ? res.error : "Try again",
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Blocked",
          description: "You will not see each other's posts.",
        });
        router.push("/wall");
        router.refresh();
      }}
    >
      Block / mute on The Wall
    </Button>
  );
}
