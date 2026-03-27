export type UserRole = "teen" | "parent" | "admin" | "moderator";
export type AudienceType = "teens" | "parents" | "shared";
export type ModerationStatus =
  | "published"
  | "pending_review"
  | "hidden"
  | "removed";
export type RiskLevel = "none" | "low" | "medium" | "high";
export type ReportTargetType = "post" | "comment" | "user";
export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";
export type ReactionType = "relate" | "thank_you" | "helpful";

export type Profile = {
  id: string;
  auth_user_id: string;
  username: string;
  role_type: UserRole;
  bio: string | null;
  is_banned: boolean;
  is_muted: boolean;
  created_at: string;
  updated_at: string;
};

export type Topic = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  audience: AudienceType;
  is_active: boolean;
  created_at: string;
};

export type Prompt = {
  id: string;
  prompt_text: string;
  slug: string;
  active_date: string | null;
  audience: AudienceType;
  is_published: boolean;
  created_at: string;
};

export type PromptSuggestion = {
  id: string;
  author_profile_id: string;
  suggestion_text: string;
  moderation_status: ModerationStatus;
  created_at: string;
};

export type PromptSuggestionWithAuthor = PromptSuggestion & {
  author: Pick<Profile, "id" | "username">;
};

export type Post = {
  id: string;
  author_profile_id: string;
  title: string | null;
  body: string;
  audience: AudienceType;
  topic_id: string | null;
  prompt_id: string | null;
  prompt_suggestion_id: string | null;
  moderation_status: ModerationStatus;
  risk_level: RiskLevel;
  ai_summary_eligible: boolean;
  body_hash: string | null;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  post_id: string;
  author_profile_id: string;
  body: string;
  moderation_status: ModerationStatus;
  risk_level: RiskLevel;
  created_at: string;
  updated_at: string;
};

export type PostWithAuthor = Post & {
  author: Pick<Profile, "id" | "username" | "role_type">;
  topic?: Pick<Topic, "id" | "name" | "slug"> | null;
  prompt?: Pick<Prompt, "id" | "prompt_text" | "slug"> | null;
  prompt_suggestion?: Pick<PromptSuggestion, "id" | "suggestion_text"> | null;
  reaction_counts?: Record<ReactionType, number>;
};

export type CommentWithAuthor = Comment & {
  author: Pick<Profile, "id" | "username" | "role_type">;
  reaction_counts?: Record<ReactionType, number>;
};
