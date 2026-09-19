import { Monitor } from "lucide-react";

import { BrandLockup } from "@/components/ui/brand-lockup";

export type MobileNoticeProps = {
  className?: string;
};

export function MobileNotice({ className }: MobileNoticeProps) {
  return (
    <main
      role="main"
      data-testid="mobile-notice"
      className={
        className ??
        "flex min-h-screen w-full flex-col items-center justify-center bg-nl-bg px-6 py-12 text-center"
      }
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <BrandLockup />

        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-nl-accent-subtle text-nl-accent">
          <Monitor className="h-10 w-10" aria-hidden="true" />
        </div>

        <div className="space-y-3">
          <h1 className="text-[22px] font-bold leading-snug tracking-nl-tight text-nl-text">
            아직 모바일 버전의 화면은 준비되지 않았어요!
          </h1>
          <p className="text-nl-body text-nl-muted leading-relaxed">
            NewsLittle은 현재 PC(데스크톱) 웹 환경에 최적화되어 있어요.
            <br />
            원활한 서비스 이용을 위해 PC 브라우저에서 접속해 주세요.
          </p>
        </div>

        <div className="w-full rounded-nl-card border border-nl-border bg-nl-subtle p-4 text-nl-caption text-nl-muted">
          💡 더 편리한 모바일 환경을 위해 열심히 준비하고 있어요. 조금만 기다려 주세요!
        </div>
      </div>
    </main>
  );
}
