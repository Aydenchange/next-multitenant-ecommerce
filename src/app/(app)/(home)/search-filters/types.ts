export type CategoryLinkItem = {
  id: string;
  name: string;
  slug: string;
};

export type CategoryNavItem = CategoryLinkItem & {
  color?: string | null;
  subcategories: CategoryLinkItem[];
};

export function toCategoryHref(slug: string): string {
  return slug.startsWith("/") ? slug : `/${slug}`;
}
