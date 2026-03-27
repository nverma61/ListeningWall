import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(3)
  .max(24)
  .regex(/^[a-zA-Z0-9_]+$/, "Use letters, numbers, and underscores only");

export const onboardingSchema = z.object({
  username: usernameSchema,
  roleType: z.enum(["teen", "parent"]),
  acceptGuidelines: z
    .boolean()
    .refine((v) => v === true, {
      message: "Please accept the community guidelines",
    }),
});

export const postSchema = z
  .object({
    title: z.string().max(200).optional().nullable(),
    body: z.string().min(1, "Write something").max(8000),
    audience: z.enum(["teens", "parents"]),
    topicId: z.string().uuid().optional().nullable(),
    promptId: z.string().uuid().optional().nullable(),
    promptSuggestionId: z.string().uuid().optional().nullable(),
  })
  .refine((d) => !(d.promptId && d.promptSuggestionId), {
    message: "Link either an official prompt or a community idea, not both.",
    path: ["promptId"],
  });

export const commentSchema = z.object({
  postId: z.string().uuid(),
  body: z.string().min(1).max(4000),
});

export const reportSchema = z.object({
  targetType: z.enum(["post", "comment", "user"]),
  targetId: z.string().uuid(),
  reasonCode: z.string().min(1).max(64),
  description: z.string().max(2000).optional().nullable(),
});

export const blockSchema = z.object({
  blockedProfileId: z.string().uuid(),
});

export const reactionSchema = z.object({
  postId: z.string().uuid().optional().nullable(),
  commentId: z.string().uuid().optional().nullable(),
  reactionType: z.enum(["relate", "thank_you", "helpful"]),
});

export const profileUpdateSchema = z.object({
  bio: z.string().max(500).optional().nullable(),
});

export const promptAdminSchema = z.object({
  promptText: z.string().min(1).max(2000),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  audience: z.enum(["teens", "parents", "shared"]),
  activeDate: z.string().optional().nullable(),
  isPublished: z.boolean(),
});
