import { redirect } from "next/navigation";

export default function ParentSpaceRedirectPage() {
  redirect("/wall");
}
