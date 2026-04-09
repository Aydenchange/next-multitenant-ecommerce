export type CategoryLinkItem = {
  id: string;
  name: string;
  slug: string;
};

export type CategoryNavItem = CategoryLinkItem & {
  color?: string | null;
  subcategories: CategoryLinkItem[];
};

export function toCategoryHref(
  categorySlug: string,
  subcategorySlug?: string,
): string {
  if (subcategorySlug) {
    return `/${categorySlug}/${subcategorySlug}`;
  }
  return `/${categorySlug}`;
}
