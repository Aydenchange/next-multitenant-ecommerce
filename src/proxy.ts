// src/proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateRequestId, REQUEST_ID_HEADER } from "@/lib/observability";

export const config = {
  matcher: ["/((?!api/|_next/|_static/|_vercel|media/|[\\w-]+\\.\\w+).*)"],
};

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "";
  const requestId = getOrCreateRequestId(req.headers);
  const requestHeaders = new Headers(req.headers);

  requestHeaders.set(REQUEST_ID_HEADER, requestId);

  if (rootDomain && host.endsWith(`.${rootDomain}`)) {
    const tenantSlug = host.replace(`.${rootDomain}`, "").split(":")[0];

    if (!tenantSlug) {
      return NextResponse.next();
    }

    requestHeaders.set("x-tenant-slug", tenantSlug);

    const response = NextResponse.rewrite(
      new URL(`/tenants/${tenantSlug}${req.nextUrl.pathname}`, req.url),
      { request: { headers: requestHeaders } },
    );

    response.headers.set(REQUEST_ID_HEADER, requestId);
    return response;
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}
