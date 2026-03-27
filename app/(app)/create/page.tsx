import { redirect } from "next/navigation";
import Link from "next/link";
import {
  fetchTopics,
  fetchAllPublishedPrompts,
  fetchPublishedPromptSuggestions,
} from "@/lib/data/misc";
import { getMyProfile, isStaffRole } from "@/lib/auth/profile";
import { PostComposer } from "@/components/app/post-composer";
export const metadata = { title: "Create post" };

export default async function CreatePostPage() {
  const profile = await getMyProfile();
  if (!profile) {
    redirect("/login?next=/create");
  }

  const [topics, officialPrompts, communitySuggestions] = await Promise.all([
    fetchTopics(),
    fetchAllPublishedPrompts(),
    fetchPublishedPromptSuggestions(100),
  ]);

  const defaultAudience =
    profile.role_type === "parent" ? ("parents" as const) : ("teens" as const);
  const audienceBehavior = isStaffRole(profile.role_type)
    ? ({ kind: "staff" } as const)
    : ({
        kind: "locked",
        audience: profile.role_type === "parent" ? "parents" : "teens",
      } as const);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Create post</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Share on The Wall as{" "}
          {audienceBehavior.kind === "locked" ? (
            <span className="font-medium text-foreground">
              {audienceBehavior.audience === "parents" ? "a parent" : "a teen"}
            </span>
          ) : (
            <span className="font-medium text-foreground">a parent or a teen</span>
          )}
          —your username is visible; your email is not.{" "}
          <Link href="/wall" className="text-primary underline-offset-4 hover:underline">
            View The Wall
          </Link>
        </p>
      </div>
      <PostComposer
        topics={topics}
        officialPrompts={officialPrompts}
        communitySuggestions={communitySuggestions}
        defaultPromptLink={null}
        defaultAudience={defaultAudience}
        audienceBehavior={audienceBehavior}
        heading="Your post"
        subheading="Topic and title are optional. Be honest and kind."
      />
    </div>
  );
}
