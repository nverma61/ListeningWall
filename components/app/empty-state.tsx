"use client";

import { motion } from "framer-motion";
import { MessageCircle, Users, Share2, Compass } from "lucide-react";

const ICONS = {
  message: MessageCircle,
  users: Users,
  share: Share2,
  topic: Compass,
} as const;

export type EmptyStateIcon = keyof typeof ICONS;

export function EmptyState({
  icon = "message",
  title,
  description,
  action,
}: {
  icon?: EmptyStateIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  const Icon = ICONS[icon];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-gradient-to-b from-muted/40 to-background px-6 py-16 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="font-serif text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </motion.div>
  );
}
