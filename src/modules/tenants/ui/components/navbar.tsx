"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

import { useTRPC } from "@/trpc/client";
import { generateTenantURL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon } from "lucide-react";

const cartSlotClassName = "w-24 flex justify-end";

const CartButtonSkeleton = () => (
  <Button disabled variant="elevated" className="bg-white min-w-24 justify-center">
    <ShoppingCartIcon className="text-black" />
  </Button>
);

const CheckoutButton = dynamic(
  () =>
    import("@/modules/checkout/ui/components/checkout-button").then(
      (mod) => mod.CheckoutButton,
    ),
  {
    ssr: false,
    loading: () => (
      <div className={cartSlotClassName}>
        <CartButtonSkeleton />
      </div>
    ),
  },
);

interface Props {
  slug: string;
}

export const Navbar = ({ slug }: Props) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.tenants.getOne.queryOptions({ slug }));

  return (
    <nav className="h-20 border-b font-medium bg-white">
      <div className="max-w-(--breakpoint-xl) mx-auto flex justify-between items-center h-full px-4 lg:px-12">
        <Link
          href={generateTenantURL(slug)}
          className="flex items-center gap-2"
        >
          {data.image?.url && (
            <Image
              src={data.image.url}
              width={32}
              height={32}
              className="rounded-full border shrink-0 size-8"
              alt={slug}
            />
          )}
          <p className="text-xl">{data.name}</p>
        </Link>
          <div className={cartSlotClassName}>
            <CheckoutButton tenantSlug={slug} hideIfEmpty />
          </div>
      </div>
    </nav>
  );
};

export const NavbarSkeleton = () => {
  return (
    <nav className="h-20 border-b font-medium bg-white">
      <div className="max-w-(--breakpoint-xl) mx-auto flex justify-between items-center h-full px-4 lg:px-12">
        <div />
        <div className={cartSlotClassName}>
          <CartButtonSkeleton />
        </div>
      </div>
    </nav>
  );
};
