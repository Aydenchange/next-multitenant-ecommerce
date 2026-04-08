"use client";

import Link from "next/link";
import { z } from "zod";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { loginSchema } from "../schemas";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

export const SignInView = () => {
  const router = useRouter();

  const trpc = useTRPC();
  const login = useMutation(
    trpc.auth.login.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        router.push("/");
      },
    }),
  );

  const form = useForm<z.infer<typeof loginSchema>>({
    mode: "all",
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    login.mutate(values);
  };

  const formErrors = form.formState.errors;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5">
      <div className="bg-[#F4F4F0] h-screen w-full lg:col-span-3 overflow-y-auto">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-8 p-4 lg:p-16"
        >
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <span className={cn("text-2xl font-semibold", poppins.className)}>
                funroad
              </span>
            </Link>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-base border-none underline"
            >
              <Link prefetch href="/sign-up">
                Sign up
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl font-medium">Welcome back to Funroad.</h1>

          <Field>
            <FieldLabel className="text-base" htmlFor="email">
              Email
            </FieldLabel>
            <Input id="email" type="email" {...form.register("email")} />
            <FieldError errors={[formErrors.email]} />
          </Field>

          <Field>
            <FieldLabel className="text-base" htmlFor="password">
              Password
            </FieldLabel>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
            />
            <FieldError errors={[formErrors.password]} />
          </Field>

          <Button
            disabled={login.isPending}
            type="submit"
            size="lg"
            variant="elevated"
            className="bg-black text-white hover:bg-pink-400 hover:text-primary"
          >
            Log in
          </Button>
        </form>
      </div>
      <div
        className="h-screen w-full lg:col-span-2 hidden lg:block"
        style={{
          backgroundImage: "url('/auth-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
};
