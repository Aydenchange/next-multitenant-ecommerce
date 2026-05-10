import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";
import {
  getOrCreateRequestId,
  logEvent,
  REQUEST_ID_HEADER,
  serializeError,
} from "@/lib/observability";

const handler = async (req: Request) => {
  const requestId = getOrCreateRequestId(req.headers);
  const requestHeaders = new Headers(req.headers);

  requestHeaders.set(REQUEST_ID_HEADER, requestId);

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: requestHeaders }),
    onError({ error, path }) {
      logEvent("error", "tRPC request failed", {
        requestId,
        path: path ?? "<unknown-path>",
        error: serializeError(error),
      });
    },
  });

  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
};

export { handler as GET, handler as POST };
