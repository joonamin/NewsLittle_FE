import { describe, expect, it } from "vitest";

import { buildImageCandidates, pickDisplayableImage } from "./image-fallback";

describe("buildImageCandidates", () => {
  it("orders the AI image before the article image", () => {
    const candidates = buildImageCandidates(
      { url: "ai.jpg", alt: "AI" },
      { url: "article.jpg", alt: "Article", attribution: "사진: 데모 뉴스 제공" },
    );

    expect(candidates.map((candidate) => candidate.origin)).toEqual(["ai", "article"]);
  });

  it("omits a missing image instead of leaving a gap", () => {
    const candidates = buildImageCandidates(null, {
      url: "article.jpg",
      alt: "Article",
      attribution: null,
    });

    expect(candidates).toEqual([
      { origin: "article", url: "article.jpg", alt: "Article", attribution: null },
    ]);
  });

  it("returns an empty list when neither image exists", () => {
    expect(buildImageCandidates(null, undefined)).toEqual([]);
  });
});

describe("pickDisplayableImage", () => {
  const aiCandidate = { origin: "ai" as const, url: "ai.jpg", alt: "AI", attribution: null };
  const articleCandidate = {
    origin: "article" as const,
    url: "article.jpg",
    alt: "Article",
    attribution: "사진: 데모 뉴스 제공",
  };

  it("prefers the first candidate that has not failed", () => {
    expect(pickDisplayableImage([aiCandidate, articleCandidate], new Set())).toEqual(aiCandidate);
  });

  it("falls back to the article image once the AI image fails to load", () => {
    expect(pickDisplayableImage([aiCandidate, articleCandidate], new Set(["ai.jpg"]))).toEqual(
      articleCandidate,
    );
  });

  it("omits the image area once every candidate has failed", () => {
    expect(
      pickDisplayableImage([aiCandidate, articleCandidate], new Set(["ai.jpg", "article.jpg"])),
    ).toBeNull();
  });

  it("omits the image area when there are no candidates", () => {
    expect(pickDisplayableImage([], new Set())).toBeNull();
  });
});
