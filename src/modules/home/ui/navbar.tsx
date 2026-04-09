"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { Poppins } from "next/font/google";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NavbarSidebar from "./navbar-sidebar";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

export default function Navbar() {
  const trpc = useTRPC();
  const session = useQuery(trpc.auth.session.queryOptions());
  const [isOpen, setIsOpen] = useState(false);
  const pathName = usePathname();
  const navbarItems = [
    { href: "/", children: "Home" },
    { href: "/about", children: "About" },
    { href: "/features", children: "Features" },
    { href: "/pricing", children: "Pricing" },
    { href: "/contact", children: "Contact" },
  ];
  return (
    <nav className=" flex mr-6 h-20 items-center justify-between  border-b font-medium bg-white">
      <Link href="/" className="pl-6 flex">
        <span className={cn("text-5xl font-semibold", poppins.className)}>
          Home
        </span>
      </Link>

      <NavbarSidebar
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        items={navbarItems}
      />

      <div className="gap-4 hidden lg:flex">
        {navbarItems.map((item) => (
          <Button
            variant="outline"
            key={item.href}
            asChild
            className={cn(
              "bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent px-3.5 text-lg",
              pathName === item.href &&
                "bg-black text-white hover:bg-black hover:text-white",
            )}
          >
            <Link href={item.href}>{item.children}</Link>
          </Button>
        ))}
      </div>
      {session.data?.user ? (
        <div className="hidden lg:flex">
          <Button
            asChild
            className="border-l border-t-0 border-b-0 border-r-0 px-12 h-full rounded-none bg-black text-white hover:bg-pink-400 hover:text-black transition-colors text-lg"
          >
            <Link href="/admin">Dashboard</Link>
          </Button>
        </div>
      ) : (
        <div className="hidden lg:flex gap-4">
          <Button asChild variant="elevated">
            <Link prefetch href="/sign-in">
              Sign In
            </Link>
          </Button>
          <Button asChild variant="elevated">
            <Link prefetch href="/sign-up">
              Start Selling
            </Link>
          </Button>
          <div
            className="flex lg:hidden items-center justify-center "
            onClick={() => setIsOpen(!isOpen)}
          >
            <MenuIcon />
          </div>
        </div>
      )}
    </nav>
  );
}
