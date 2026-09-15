// lib: 브랜드 락업 (W8udpb), Brand Icon / 원본 부엉이 · 배경 제거 (bTRk9)
import Image from "next/image";

export type BrandLockupProps = {
  tagline?: string;
};

export function BrandLockup({ tagline = "짧게 읽는 하루 뉴스" }: BrandLockupProps) {
  return (
    <div className="flex items-center gap-2.5">
      <Image src="/images/logo.png" alt="NewsLittle" width={40} height={40} />
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center">
          <span className="text-[24px] leading-[1.375] text-nl-text tracking-nl-tight font-bold">뉴스</span>
          <span
            className="bg-[linear-gradient(250deg,#373084_0%,#5055B1_30%,#8B35E8_62%,#DE329D_100%)] bg-clip-text text-[24px] leading-[1.375] tracking-nl-tight font-bold text-transparent"
          >
            리틀
          </span>
        </div>
        <span className="text-[11px] leading-[1.5] tracking-[-0.01em] text-nl-muted font-normal">
          {tagline}
        </span>
      </div>
    </div>
  );
}
