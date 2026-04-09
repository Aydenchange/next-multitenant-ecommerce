"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useTRPC } from "@/trpc/client";

import Categories from "./Categories";
import SearchInput from "./SearchInput";

const categoriesStaleTime = 5 * 60 * 1000;

function formatSlugLabel(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function CategoriesSkeleton() {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex flex-nowrap items-center gap-2 min-w-0">
        <div className="h-10 w-24 rounded-md bg-neutral-200 animate-pulse" />
        <div className="h-10 w-28 rounded-md bg-neutral-200 animate-pulse" />
        <div className="h-10 w-20 rounded-md bg-neutral-200 animate-pulse" />
        <div className="h-10 w-32 rounded-md bg-neutral-200 animate-pulse" />
      </div>
      <div className="h-10 w-24 rounded-md bg-neutral-200 animate-pulse shrink-0" />
    </div>
  );
}

export default function SearchFiltersClient() {
  const [hoverColor, setHoverColor] = useState<string | undefined>(undefined);
  const pathname = usePathname();
  const trpc = useTRPC();
  const { data = [], isLoading } = useQuery({
    ...trpc.categories.getAll.queryOptions(),
    staleTime: categoriesStaleTime,
  });

  const breadcrumbItems = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0 || segments.length > 2) {
      return [];
    }

    const [categorySlug, subcategorySlug] = segments;
    const category = data.find((item) => item.slug === categorySlug);
    if (!category) {
      return [];
    }

    const subcategory = category?.subcategories.find(
      (item) => item.slug === subcategorySlug,
    );

    const items: Array<{ label: string; href?: string }> = [
      { label: "Home", href: "/" },
    ];

    if (categorySlug) {
      items.push({
        label: category.name ?? formatSlugLabel(categorySlug),
        href: subcategorySlug ? `/${categorySlug}` : undefined,
      });
    }

    if (subcategorySlug) {
      items.push({
        label: subcategory?.name ?? formatSlugLabel(subcategorySlug),
      });
    }

    return items;
  }, [data, pathname]);

  return (
    <div
      className="mt-4 px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full transition-colors"
      style={hoverColor ? { backgroundColor: hoverColor } : undefined}
    >
      <SearchInput />
      {isLoading ? (
        <CategoriesSkeleton />
      ) : (
        <Categories data={data} onHoverColorChange={setHoverColor} />
      )}
      {breadcrumbItems.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1;

              return (
                <Fragment key={`${item.label}-${index}`}>
                  <BreadcrumbItem>
                    {isLast || !item.href ? (
                      <BreadcrumbPage className="text-xl font-medium">
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        asChild
                        className="text-xl font-medium underline text-primary"
                      >
                        <Link href={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && (
                    <BreadcrumbSeparator className="text-primary font-medium text-lg" />
                  )}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}
    </div>
  );
}
