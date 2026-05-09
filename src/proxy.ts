// src/proxy.ts
import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!api/|_next/|_static/|_vercel|media/|[\\w-]+\\.\\w+).*)"],
};

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "";

  if (rootDomain && host.endsWith(`.${rootDomain}`)) {
    const tenantSlug = host.replace(`.${rootDomain}`, "").split(":")[0];

    if (!tenantSlug) {
      return NextResponse.next();
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-tenant-slug", tenantSlug);

    return NextResponse.rewrite(
      new URL(`/tenants/${tenantSlug}${req.nextUrl.pathname}`, req.url),
      { request: { headers: requestHeaders } },
    );
  }

  return NextResponse.next();
}
