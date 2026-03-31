"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

import SubCategoryMenu from "./SubCategoryMenu";

export default function CategroyDropdown({ category }: { category: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className="relative inline-block"
    >
      <Button
        variant="elevated"
        style={isOpen ? { backgroundColor: category.color } : {}}
        className={isOpen ? "text-white" : ""}
      >
        {category.name}
      </Button>

      <SubCategoryMenu
        isOpen={isOpen}
        subcategories={category.subcategories}
        color={category.color}
      />
    </div>
  );
}
