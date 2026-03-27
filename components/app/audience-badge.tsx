import { Badge } from "@/components/ui/badge";
import type { AudienceType } from "@/lib/types/database";

const labels: Record<AudienceType, string> = {
  teens: "Teen space",
  parents: "Parent space",
  shared: "Shared",
};

export function AudienceBadge({ audience }: { audience: AudienceType }) {
  const variant =
    audience === "teens" ? "teen" : audience === "parents" ? "parent" : "shared";
  return <Badge variant={variant}>{labels[audience]}</Badge>;
}
