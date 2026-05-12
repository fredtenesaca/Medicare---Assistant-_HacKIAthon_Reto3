import { redirect } from "next/navigation";

export default function AssistantPage() {
  redirect("/?openChat=1");
}
