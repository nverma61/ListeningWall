import { redirect } from "next/navigation";

/** Legacy route; AI digests were removed from the product. */
export default function DigestRemovedPage() {
  redirect("/wall");
}
