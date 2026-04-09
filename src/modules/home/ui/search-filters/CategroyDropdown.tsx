"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

import SubCategoryMenu from "./SubCategoryMenu";
import { CategoryNavItem } from "./types";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CategroyDropdown({
  category,
  onHoverColorChange,
}: {
  category: CategoryNavItem;
  onHoverColorChange?: (color?: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubcategories = (category.subcategories?.length ?? 0) > 0;

  const params = useParams();
  const categoryParam = params.category as string | undefined;
  const activeCategory = categoryParam || "all";
  const isActive = activeCategory === category.slug;
  if (isActive) {
    onHoverColorChange?.(category.color ?? undefined);
  }

  return (
    <div
      onMouseEnter={() => {
        setIsOpen(true);
      }}
      onMouseLeave={() => {
        setIsOpen(false);
      }}
      className="relative flex-none"
    >
      <Button
        variant="elevated"
        style={
          (isOpen || isActive) && category.color
            ? { backgroundColor: category.color }
            : undefined
        }
        className={(isOpen || isActive) && hasSubcategories ? "text-white" : ""}
      >
        <Link href={`/${category.slug}`}>{category.name}</Link>
      </Button>

      {isOpen && hasSubcategories && (
        <SubCategoryMenu
          subcategories={category.subcategories ?? []}
          color={category.color ?? undefined}
          categorySlug={category.slug}
        />
      )}
    </div>
  );
}
