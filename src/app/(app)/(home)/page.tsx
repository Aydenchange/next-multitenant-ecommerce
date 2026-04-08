import { caller } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await caller.auth.session();

  if (!session.user) {
    redirect("/sign-in");
  }
  return <div className="p-4">{JSON.stringify(session.user, null, 2)}</div>;
}
