export const REQUEST_ID_HEADER = "x-request-id";

type LogLevel = "debug" | "info" | "warn" | "error";

type LogFields = Record<string, unknown>;

const randomId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

export function getOrCreateRequestId(headers: Headers) {
  return headers.get(REQUEST_ID_HEADER) ?? randomId();
}

export function getSlowProcedureThresholdMs() {
  const threshold = Number(process.env.TRPC_SLOW_PROCEDURE_MS ?? 500);
  return Number.isFinite(threshold) ? threshold : 500;
}

export function logEvent(
  level: LogLevel,
  message: string,
  fields: LogFields = {},
) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...fields,
  };

  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

export function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
    };
  }

  return {
    message: String(error),
  };
}
