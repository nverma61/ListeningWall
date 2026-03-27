"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { unblockUser } from "@/app/actions/blocks";
import { useRouter } from "next/navigation";

export function UnblockButton({ blockedProfileId }: { blockedProfileId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await unblockUser(blockedProfileId);
        setLoading(false);
        router.refresh();
      }}
    >
      Unblock
    </Button>
  );
}
