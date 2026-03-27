import type { ModerationStatus, RiskLevel } from "@/lib/types/database";

export type ScanResult = {
  riskLevel: RiskLevel;
  suggestedStatus: ModerationStatus;
  labels: string[];
  showResourceBanner: boolean;
};

const CRISIS_PATTERNS = [
  /\bkill\s+myself\b/i,
  /\bsuicid\w*\b/i,
  /\bend\s+it\s+all\b/i,
  /\bself[\s-]?harm\b/i,
  /\bcut\s+myself\b/i,
  /\bdon'?t\s+want\s+to\s+live\b/i,
  /\bunalive\b/i,
];

const EXPLOITATION_PATTERNS = [
  /\bchild\s+porn\b/i,
  /\bcsam\b/i,
  /\bsexual\s+exploitation\b/i,
];

const VIOLENCE_PATTERNS = [
  /\bshoot\s+up\b/i,
  /\bbomb\s+the\b/i,
  /\bgoing\s+to\s+hurt\s+them\b/i,
];

const HARASSMENT_PATTERNS = [
  /\bkill\s+yourself\b/i,
  /\bneck\s+yourself\b/i,
  /\bgo\s+die\b/i,
];

const SPAM_PATTERNS = [
  /\bclick\s+here\s+now\b/i,
  /\bviagra\b/i,
  /\bcrypto\s+giveaway\b/i,
];

const riskOrder: RiskLevel[] = ["none", "low", "medium", "high"];

function maxRisk(a: RiskLevel, b: RiskLevel): RiskLevel {
  return riskOrder.indexOf(a) >= riskOrder.indexOf(b) ? a : b;
}

function matchAny(text: string, patterns: RegExp[]) {
  return patterns.some((p) => p.test(text));
}

/**
 * Deterministic moderation scan. Replace or augment with a provider later.
 */
export function scanContent(text: string): ScanResult {
  const labels: string[] = [];
  let riskLevel: RiskLevel = "none";
  let suggestedStatus: ModerationStatus = "published";
  let showResourceBanner = false;

  if (matchAny(text, CRISIS_PATTERNS)) {
    labels.push("crisis_language");
    riskLevel = "high";
    suggestedStatus = "pending_review";
    showResourceBanner = true;
  }

  if (matchAny(text, EXPLOITATION_PATTERNS)) {
    labels.push("exploitation");
    riskLevel = maxRisk(riskLevel, "high");
    suggestedStatus = "pending_review";
  }

  if (matchAny(text, VIOLENCE_PATTERNS)) {
    labels.push("violence");
    riskLevel = maxRisk(riskLevel, "medium");
    if (suggestedStatus === "published") suggestedStatus = "pending_review";
  }

  if (matchAny(text, HARASSMENT_PATTERNS)) {
    labels.push("harassment");
    riskLevel = maxRisk(riskLevel, "medium");
    if (suggestedStatus === "published") suggestedStatus = "pending_review";
  }

  if (matchAny(text, SPAM_PATTERNS)) {
    labels.push("spam");
    riskLevel = maxRisk(riskLevel, "low");
  }

  return {
    riskLevel,
    suggestedStatus,
    labels,
    showResourceBanner,
  };
}
