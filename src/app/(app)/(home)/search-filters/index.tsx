import configPromise from "@payload-config";
import { getPayload } from "payload";
import { Category } from "@/payload-types";

import Categories from "./Categories";
import SearchInput from "./SearchInput";
import { CategoryNavItem } from "./types";

export default async function SearchFilters() {
  const payload = await getPayload({
    config: configPromise,
  });

  const data = await payload.find({
    collection: "categories",
    depth: 1, // Populate subcategories, subcategores.[0] will be a type of "Category"
    pagination: false,
    where: {
      parent: {
        exists: false,
      },
    },
  });

  const formattedData = data.docs.map((doc) => ({
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    color: doc.color ?? null,
    subcategories: (doc.subcategories?.docs ?? [])
      .filter((item): item is Category => typeof item !== "string")
      .map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
      })),
  })) satisfies CategoryNavItem[];

  return (
    <div className="mt-4 px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full">
      <SearchInput />
      <Categories data={formattedData} />
    </div>
  );
}
