"use client";

import { useState } from "react";
import SubCategoryMenu from "./SubCategoryMenu";

export default function CategroyDropdown({ category }: { category: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className="flex gap-4"
    >
      <div>{category.name}</div>
      <div>
        <SubCategoryMenu
          isOpen={isOpen}
          subcategories={category.subcategories}
        />
      </div>
    </div>
  );
}
