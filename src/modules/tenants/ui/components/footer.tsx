import Link from "next/link";
import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import { getPublicEnv } from "@/lib/public-env";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

export const Footer = () => {
  const env = getPublicEnv();

  return (
    <footer className="border-t font-medium bg-white">
      <div className="max-w-(--breakpoint-xl) mx-auto flex items-center h-full gap-2 px-4 py-6 lg:px-12">
        <p>Powered by</p>
        <Link href={env.NEXT_PUBLIC_APP_URL}>
          <span className={cn("text-2xl font-semibold", poppins.className)}>
            funroad
          </span>
        </Link>
      </div>
    </footer>
  );
};
