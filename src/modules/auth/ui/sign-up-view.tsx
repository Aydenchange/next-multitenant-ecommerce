"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { registerSchema } from "../schemas";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

export const SignUpView = () => {
  const router = useRouter();

  const trpc = useTRPC();
  const register = useMutation(
    trpc.auth.register.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        router.push("/");
      },
    }),
  );

  const form = useForm<z.infer<typeof registerSchema>>({
    mode: "all",
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    register.mutate(values);
  };

  const username = useWatch({
    control: form.control,
    name: "username",
  });
  const formErrors = form.formState.errors;
  const showPreview = username && !formErrors.username;
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
              <Link prefetch href="/sign-in">
                Sign in
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl font-medium">
            Join over 1,580 creators earning money on Funroad.
          </h1>

          <Field>
            <FieldLabel className="text-base" htmlFor="username">
              Username
            </FieldLabel>
            <Input id="username" {...form.register("username")} />
            <FieldDescription className={cn("hidden", showPreview && "block")}>
              Your store will be available at&nbsp;
              {/* TODO: Use proper method to generate preview url */}
              <strong>{username}</strong>.shop.com
            </FieldDescription>
            <FieldError errors={[formErrors.username]} />
          </Field>

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
            disabled={register.isPending}
            type="submit"
            size="lg"
            variant="elevated"
            className="bg-black text-white hover:bg-pink-400 hover:text-primary"
          >
            Create account
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
