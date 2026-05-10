import { describe, expect, it } from "vitest";

import {
  getOrCreateRequestId,
  getSlowProcedureThresholdMs,
  REQUEST_ID_HEADER,
  serializeError,
} from "@/lib/observability";

describe("observability helpers", () => {
  it("reuses an existing request id", () => {
    const headers = new Headers({
      [REQUEST_ID_HEADER]: "req_existing",
    });

    expect(getOrCreateRequestId(headers)).toBe("req_existing");
  });

  it("creates a request id when none is present", () => {
    const requestId = getOrCreateRequestId(new Headers());

    expect(requestId.length).toBeGreaterThan(8);
  });

  it("falls back to the default slow procedure threshold", () => {
    const previousThreshold = process.env.TRPC_SLOW_PROCEDURE_MS;
    process.env.TRPC_SLOW_PROCEDURE_MS = "not-a-number";

    expect(getSlowProcedureThresholdMs()).toBe(500);

    process.env.TRPC_SLOW_PROCEDURE_MS = previousThreshold;
  });

  it("serializes errors without throwing", () => {
    expect(serializeError(new Error("boom"))).toEqual(
      expect.objectContaining({
        name: "Error",
        message: "boom",
      }),
    );

    expect(serializeError("plain failure")).toEqual({
      message: "plain failure",
    });
  });
});
