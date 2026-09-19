import { useState } from "react";
import { CheckCircle2, HelpCircle, Lightbulb, Sparkles, BookOpen } from "lucide-react";

import type { AdminArticleReviewItem, AdminQuizItem, AnswerFormat } from "@/features/contracts/admin-models";
import { cn } from "@/lib/cn";

type SideBySideViewerProps = {
  reviewItem: AdminArticleReviewItem;
  assetFilter: "all" | "summary" | "quiz";
};

const formatBadgeText: Record<AnswerFormat, string> = {
  OX: "OX 문항",
  MULTIPLE_CHOICE: "객관식 (4지선다)",
  SUBJECTIVE: "주관식",
};

export function SideBySideViewer({ reviewItem, assetFilter }: SideBySideViewerProps) {
  const showSummary = assetFilter === "all" || assetFilter === "summary";
  const showQuiz = assetFilter === "all" || assetFilter === "quiz";

  return (
    <div className="grid grid-cols-2 gap-6 items-start">
      {/* ========================================================================= */}
      {/* 1. 좌측 열: 수집 원문 본문                                                */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-nl-border bg-nl-surface p-6 shadow-xs flex flex-col min-h-[580px] max-h-[760px]">
        {/* 상단 레이블 */}
        <div className="flex items-center justify-between border-b border-nl-border pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-nl-accent" />
            <span className="text-sm font-bold text-nl-text">수집 본문 · 보유 중</span>
          </div>
          <span className="text-xs text-nl-muted">
            {reviewItem.source.name} · {reviewItem.publishedAt}
          </span>
        </div>

        {/* 기사 헤드라인 */}
        <div className="pt-4 pb-3">
          <h2 className="text-lg font-bold text-nl-text leading-snug">
            {reviewItem.title}
          </h2>
          <p className="mt-1 text-xs text-nl-muted">
            수집 시각: {reviewItem.collectedAt} · 자산 식별자: {reviewItem.articleCode}
          </p>
        </div>

        {/* 스크롤 가능한 기사 본문 영역 */}
        <div className="flex-1 overflow-y-auto pr-2 text-sm leading-relaxed text-nl-text space-y-4 font-normal">
          <p className="whitespace-pre-line">{reviewItem.bodyText}</p>
        </div>

        {/* 하단 저작권 및 보안 안내 */}
        <div className="border-t border-nl-border pt-3 mt-4 text-[11px] text-nl-muted flex justify-between items-center">
          <span>원문 다운로드·복사 내보내기 불가 (COM-03)</span>
          <span>{reviewItem.source.name} 라이선스 계약 적용</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 우측 열: AI 생성물 (요약 및 퀴즈)                                      */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-nl-border bg-nl-surface p-6 shadow-xs flex flex-col min-h-[580px] max-h-[760px] overflow-hidden">
        {/* 상단 레이블 */}
        <div className="flex items-center justify-between border-b border-nl-border pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-bold text-nl-text">AI 생성물 · 검수 대기</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-semibold",
                reviewItem.summary.reviewStatus === "APPROVED"
                  ? "bg-emerald-100 text-emerald-700"
                  : reviewItem.summary.reviewStatus === "REJECTED"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-800"
              )}
            >
              {reviewItem.summary.reviewStatus === "APPROVED"
                ? "승인 완료"
                : reviewItem.summary.reviewStatus === "REJECTED"
                  ? "반려됨"
                  : "검수 대기중"}
            </span>
          </div>
        </div>

        {/* 스크롤 가능한 생성물 리스트 */}
        <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-6">
          {/* A. 텍스트 요약 섹션 */}
          {showSummary && (
            <div className="rounded-lg border border-purple-100 bg-purple-50/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                  생성 요약문 (홈 피드 게시용)
                </span>
                <span className="text-[11px] text-nl-muted">사실/의견 분리 점검</span>
              </div>
              <p className="text-sm leading-relaxed text-nl-text font-medium">
                {reviewItem.summary.text}
              </p>
            </div>
          )}

          {/* B. 퀴즈 문항 섹션 (실제 마이그레이션된 퀴즈들) */}
          {showQuiz && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-nl-muted">
                  퀴즈 문항 세트 ({reviewItem.quizzes.length}문항)
                </span>
                <span className="text-[11px] text-nl-muted">OX / 객관식 / 주관식</span>
              </div>

              {reviewItem.quizzes.map((quiz, idx) => {
                const correctAnswer = quiz.correct_answer ?? quiz.correctAnswer ?? "";
                const hint1 = quiz.hint_1 ?? quiz.hint1 ?? "";
                const hint2 = quiz.hint_2 ?? quiz.hint2 ?? "";
                const formatKey = quiz.answer_format ?? quiz.answerFormat ?? "OX";

                return (
                  <div
                    key={quiz.id}
                    className="rounded-lg border border-nl-border bg-nl-surface p-4 space-y-3"
                  >
                    {/* 문항 헤더 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-nl-accent">
                          Q{idx + 1}.
                        </span>
                        <span className="rounded-sm bg-nl-subtle px-1.5 py-0.5 text-[10px] font-semibold text-nl-muted">
                          {formatBadgeText[formatKey] ?? formatKey}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-nl-muted">ID #{quiz.id}</span>
                    </div>

                    {/* 문항 지문 */}
                    <p className="text-sm font-semibold text-nl-text leading-snug">
                      {quiz.prompt}
                    </p>

                    {/* 객관식 보기 리스트 */}
                    {quiz.choices && quiz.choices.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {quiz.choices.map((choice) => (
                          <div
                            key={choice.id}
                            className={cn(
                              "flex items-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors",
                              choice.id === correctAnswer
                                ? "border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold"
                                : "border-nl-border bg-nl-subtle/50 text-nl-text"
                            )}
                          >
                            <span className="font-mono uppercase font-bold text-nl-muted">
                              {choice.id}.
                            </span>
                            <span>{choice.text}</span>
                            {choice.id === correctAnswer && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 ml-auto" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 정답 표시 */}
                    <div className="rounded-md bg-nl-subtle p-2.5 text-xs space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-nl-text">정답:</span>
                        <strong className="text-emerald-700 font-bold">{correctAnswer}</strong>
                        {quiz.key_concepts && quiz.key_concepts.length > 0 && (
                          <div className="ml-2 flex items-center gap-1">
                            <span className="text-[10px] text-nl-muted">핵심 키워드:</span>
                            {quiz.key_concepts.map((kc, kIdx) => (
                              <span
                                key={kIdx}
                                className="rounded-sm bg-white px-1.5 py-0.5 text-[10px] font-medium text-purple-700 border border-purple-200"
                              >
                                {kc}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 1차 / 2차 힌트 */}
                      <div className="text-[11px] text-nl-muted pt-1 border-t border-nl-border/60 space-y-0.5">
                        <p>
                          <strong className="text-nl-text">1차 힌트:</strong> {hint1}
                        </p>
                        <p>
                          <strong className="text-nl-text">2차 힌트:</strong> {hint2}
                        </p>
                      </div>

                      {/* 해설 */}
                      <p className="text-[11px] text-nl-muted pt-1">
                        <strong className="text-nl-text">해설:</strong> {quiz.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
