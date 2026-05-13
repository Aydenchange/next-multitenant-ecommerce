import { cookies as getCookies } from "next/headers";
import { getPublicEnv } from "@/lib/public-env";

interface Props {
  prefix: string;
  value: string;
}

export const generateAuthCookie = async ({ prefix, value }: Props) => {
  const cookies = await getCookies();
  const isProduction = process.env.NODE_ENV === "production";
  const rootDomain = getPublicEnv().NEXT_PUBLIC_ROOT_DOMAIN;

  cookies.set({
    name: `${prefix}-token`,
    value: value,
    httpOnly: true,
    path: "/",
    sameSite: isProduction ? "none" : "lax",
    domain: isProduction && rootDomain ? rootDomain : undefined,
    secure: isProduction,
  });
};
