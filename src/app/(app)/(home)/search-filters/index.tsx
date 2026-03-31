import configPromise from "@payload-config";
import { getPayload } from "payload";
import { Category } from "@/payload-types";

import Categories from "./Categories";
import SearchInput from "./SearchInput";

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
    ...doc,
    subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
      // Because of "depth: 1" we are confident "doc" will be a type of "Category"
      ...(doc as Category),
      subcategories: undefined,
    })),
  }));

  return (
    <div className="mt-4 px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full">
      <SearchInput />
      <Categories data={formattedData} />
    </div>
  );
}
