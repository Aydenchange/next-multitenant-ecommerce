"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

import SubCategoryMenu from "./SubCategoryMenu";

export default function CategroyDropdown({ category }: { category: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubcategories = (category.subcategories?.length ?? 0) > 0;

  return (
    <div
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className="relative flex-none"
    >
      <Button
        variant="elevated"
        style={
          isOpen && category.color
            ? { backgroundColor: category.color }
            : undefined
        }
        className={isOpen && hasSubcategories ? "text-white" : ""}
      >
        {category.name}
      </Button>

      {isOpen && hasSubcategories && (
        <SubCategoryMenu
          subcategories={category.subcategories ?? []}
          color={category.color ?? undefined}
        />
      )}
    </div>
  );
}
