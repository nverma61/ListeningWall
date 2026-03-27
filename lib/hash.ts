import { createHash } from "crypto";

export function normalizeBodyForHash(body: string) {
  return body.trim().replace(/\s+/g, " ").toLowerCase();
}

export function bodyHash(body: string) {
  return createHash("sha256").update(normalizeBodyForHash(body)).digest("hex");
}
