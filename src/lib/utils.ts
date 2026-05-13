import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getPublicEnv } from "@/lib/public-env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTenantURL(tenantSlug: string) {
  const env = getPublicEnv();

  // In development mode, use normal routing
  if (process.env.NODE_ENV === "development") {
    return `${env.NEXT_PUBLIC_APP_URL}/tenants/${tenantSlug}`;
  }

  const protocol = "https";
  const domain = env.NEXT_PUBLIC_ROOT_DOMAIN;

  // In production, use subdomain routing
  return `${protocol}://${tenantSlug}.${domain}`;
}

export function formatCurrency(value: number | string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "$0";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
