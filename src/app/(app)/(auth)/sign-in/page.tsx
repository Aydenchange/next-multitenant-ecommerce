import { redirect } from "next/navigation";
import { SignInView } from "@/modules/auth/ui/sign-in-view";
import { caller } from "@/trpc/server";

const Page = async () => {
  const session = await caller.auth.session();

  console.log("session", session);
  if (session.user) {
    redirect("/");
  }
  return <SignInView />;
};

export default Page;
