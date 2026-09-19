import type { AdminAsset, AdminDeletionTask, AdminReport, ReportClassification, UsageBasis, UsageBasisStatusV2 } from "@/features/contracts/admin-models";

const clone = <T,>(value: T): T => structuredClone(value);
const log = (action: string, reason: string) => ({ id: crypto.randomUUID(), actor: "운영자 A", action, reason, createdAt: "2026.09.20 14:20" });

const usageBases: UsageBasis[] = [
  { id: "LIC-004", sourceName: "리틀데일리", targetLabel: "기사 메타데이터", basisType: "LICENSE", status: "CONDITIONAL", documentUrl: "https://example.com/license-004", documentVersion: "v2", startDate: "2026-09-01", endDate: "2026-09-30", attributionRequirement: "매체명·게시일·원문 링크", reviewer: "검토자 A", approver: "운영자 A", allowedActions: { collect: true, store: true, externalAi: false, generate: false, publish: true, retain: true }, blockedOperations: ["외부 AI 전송", "AI 생성"], auditLogs: [{ id: "ul-1", actor: "운영자 A", action: "조건 변경", reason: "v2 조건 반영", createdAt: "2026.09.13 16:20" }] },
  { id: "FAIR-012", sourceName: "시사랩", targetLabel: "기사 이미지", basisType: "FAIR_USE_REVIEW", status: "PENDING", documentUrl: null, documentVersion: null, startDate: null, endDate: null, attributionRequirement: "검토 전", reviewer: null, approver: null, allowedActions: { collect: false, store: false, externalAi: false, generate: false, publish: false, retain: false }, blockedOperations: ["수집", "저장", "AI 처리", "게시", "출제"], auditLogs: [] },
];

const assets: AdminAsset[] = [{ articleId: 8, articleCode: "N-0913-08", title: "도심의 열을 낮추는 나무", status: "PUBLISHED", usageBasisStatus: "CONDITIONAL", bodyRetained: true, publishedAt: "2026-09-13 09:30", expiresAt: "2026-09-30 23:59", activeQuizSessionCount: 2, linkedAssets: [{ id: "S-008", type: "요약", status: "홈 게시 중", publishedAt: "09.13", expiresAt: "09.30" }, { id: "Q-008", type: "문항", status: "퀴즈 출제 중", publishedAt: "09.13", expiresAt: "09.30" }, { id: "I-008", type: "이미지", status: "검수 통과", publishedAt: null, expiresAt: "09.30" }], auditLogs: [{ id: "al-1", actor: "운영자 A", action: "게시 확인", reason: "검수·근거 확인", createdAt: "2026.09.13 09:30" }] }];

const deletions: AdminDeletionTask[] = [{
  id: "DEL-031", assetCode: "N-0907-03", reason: "본문 보존 기한 도달", status: "FAILED",
  requestedAt: "2026-09-14 09:00", dueAt: "2026-09-14 09:00",
  scopes: [
    ...["원본 저장소", "처리 대기열", "임시 데이터", "프롬프트·로그", "이미지 배포본"].map((label, index) => ({ scope: `scope-${index}`, label, status: "CONFIRMED" as const, detail: "09:04 확인" })),
    { scope: "cache", label: "검색·캐시", status: "FAILED", detail: "CDN 응답 시간 초과" },
    { scope: "backup", label: "백업", status: "PENDING", detail: "보존 정책 검증 중" },
    { scope: "processor", label: "외부 처리자 사본", status: "PENDING", detail: "처리자 증빙 미수신" },
  ],
  retentionException: null,
  auditLogs: [{ id: "dl-1", actor: "시스템", action: "삭제 요청", reason: "보존 기한 도달", createdAt: "2026.09.14 09:00" }],
}];

const reports: AdminReport[] = [
  { id: "R-024", targetCode: "Q-008", type: "JUDGMENT_ERROR", status: "TRIAGED", receivedAt: "2026.09.20 09:32", content: "같은 뜻으로 답했는데 오답으로 판정됐어요.", contact: null, classification: "CORRECTION", attachedAnswer: "잎에서 물이 증발하는 과정", judgeVersion: "v1.2", onHold: false, decisionNote: "동의 표현 허용 여부 확인", replyRecord: null, auditLogs: [{ id: "rl-1", actor: "운영자 A", action: "판단 중으로 변경", reason: "판정 기준 대조", createdAt: "2026.09.20 09:36" }] },
  { id: "R-023", targetCode: "I-006", type: "RIGHTS", status: "HOLDING", receivedAt: "2026.09.20 09:18", content: "이미지 이용 권리를 확인해 주세요.", contact: "r***@example.com", classification: "RIGHTS_CLAIM", attachedAnswer: null, judgeVersion: null, onHold: true, decisionNote: null, replyRecord: null, auditLogs: [] },
];

function find<T>(items: T[], predicate: (item: T) => boolean) { const item = items.find(predicate); if (!item) throw new Error("NOT_FOUND"); return item; }

export const mockAdminOperationsStore = {
  usageBases: () => clone(usageBases), usageBasis: (id: string) => clone(find(usageBases, (item) => item.id === id)),
  transitionUsageBasis(id: string, status: UsageBasisStatusV2, reason: string) { const item = find(usageBases, (entry) => entry.id === id); item.status = status; item.approver = "운영자 A"; item.auditLogs.unshift(log("상태 전환", reason)); return clone(item); },
  updateUsageBasis(id: string, patch: Partial<UsageBasis>) { const item = find(usageBases, (entry) => entry.id === id); Object.assign(item, patch); item.auditLogs.unshift(log("근거 수정", "이용 조건 갱신")); return clone(item); },
  assets: () => clone(assets), asset: (id: number) => clone(find(assets, (item) => item.articleId === id)),
  assetAction(id: number, action: "publish" | "suspend" | "withdraw" | "restore" | "correct", reason: string) { const item = find(assets, (entry) => entry.articleId === id); item.status = action === "publish" || action === "restore" ? "PUBLISHED" : action === "correct" ? "CORRECTING" : action === "withdraw" ? "WITHDRAWN" : "SUSPENDED"; item.auditLogs.unshift(log(action, reason)); return clone(item); },
  deletions: () => clone(deletions), deletion: (id: string) => clone(find(deletions, (item) => item.id === id)),
  retryDeletion(id: string) { const item = find(deletions, (entry) => entry.id === id); item.scopes.filter((scope) => scope.status === "FAILED").forEach((scope) => { scope.status = "IN_PROGRESS"; scope.detail = "재시도 중"; }); item.status = "IN_PROGRESS"; item.auditLogs.unshift(log("실패 범위 재시도", "운영자 요청")); return clone(item); },
  confirmScope(id: string, scopeId: string, reason: string) { const item = find(deletions, (entry) => entry.id === id); const scope = find(item.scopes, (entry) => entry.scope === scopeId); scope.status = "CONFIRMED"; scope.detail = reason; item.status = item.scopes.every((entry) => entry.status === "CONFIRMED") ? "CONFIRMED" : "IN_PROGRESS"; item.auditLogs.unshift(log("삭제 확인", `${scope.label}: ${reason}`)); return clone(item); },
  retention(id: string, req: { basis: string; period: string; accessScope: string }) { const item = find(deletions, (entry) => entry.id === id); item.retentionException = req; item.auditLogs.unshift(log("법정 보존 예외", req.basis)); return clone(item); },
  reports: () => clone(reports), report: (id: string) => clone(find(reports, (item) => item.id === id)),
  classify(id: string, classification: ReportClassification, note: string) { const item = find(reports, (entry) => entry.id === id); item.classification = classification; item.decisionNote = note; item.status = "TRIAGED"; item.auditLogs.unshift(log("사유 분류", note)); return clone(item); },
  hold(id: string, reason: string) { const item = find(reports, (entry) => entry.id === id); item.onHold = true; item.status = "HOLDING"; item.auditLogs.unshift(log("우선 보류", reason)); return clone(item); },
  resolve(id: string, status: "RESOLVED" | "REJECTED", reason: string) { const item = find(reports, (entry) => entry.id === id); item.status = status; item.auditLogs.unshift(log(status === "RESOLVED" ? "조치 완료" : "기각", reason)); return clone(item); },
  reply(id: string, reply: string) { const item = find(reports, (entry) => entry.id === id); item.replyRecord = reply; item.auditLogs.unshift(log("회신 기록", reply)); return clone(item); },
};
