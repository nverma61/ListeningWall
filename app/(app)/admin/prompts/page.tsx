import { PromptAdminForm } from "./prompt-form";

export default function AdminPromptsPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Prompts</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Create or update a prompt by slug. Set an active date for “prompt of the day.”
        </p>
      </div>
      <PromptAdminForm />
    </div>
  );
}
