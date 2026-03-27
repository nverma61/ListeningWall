import { LifeBuoy } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CRISIS_NOTE, PLATFORM_SAFETY_NOTE } from "@/lib/constants";

export function ResourceBanner() {
  return (
    <Alert variant="safety" className="mb-6">
      <LifeBuoy className="h-4 w-4" />
      <AlertTitle>Take care of yourself</AlertTitle>
      <AlertDescription className="space-y-2 text-sm">
        <p>{PLATFORM_SAFETY_NOTE}</p>
        <p>{CRISIS_NOTE}</p>
        <p className="text-muted-foreground">
          If you are in the United States, you can call or text{" "}
          <strong>988</strong> for the Suicide &amp; Crisis Lifeline (availability
          varies by region—check local resources).
        </p>
      </AlertDescription>
    </Alert>
  );
}
