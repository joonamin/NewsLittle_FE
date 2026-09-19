import { describe, expect, it } from "vitest";

import { mockAdminOperationsStore } from "./admin-operations-store";

describe("admin operations mock store", () => {
  it("tracks usage-basis transitions with an immutable audit entry", () => {
    const updated = mockAdminOperationsStore.transitionUsageBasis("FAIR-012", "SUSPENDED", "문서 재검토 필요");
    expect(updated.status).toBe("SUSPENDED");
    expect(updated.auditLogs[0]).toMatchObject({ action: "상태 전환", reason: "문서 재검토 필요" });
  });

  it("retries only failed deletion scopes", () => {
    const updated = mockAdminOperationsStore.retryDeletion("DEL-031");
    expect(updated.scopes.find((scope) => scope.scope === "cache")?.status).toBe("IN_PROGRESS");
    expect(updated.scopes.find((scope) => scope.scope === "backup")?.status).toBe("PENDING");
  });

  it("holds and resolves a report", () => {
    const held = mockAdminOperationsStore.hold("R-024", "권리 확인 전 우선 보류");
    expect(held).toMatchObject({ status: "HOLDING", onHold: true });
    const resolved = mockAdminOperationsStore.resolve("R-024", "RESOLVED", "재검수 요청");
    expect(resolved.status).toBe("RESOLVED");
  });
});
