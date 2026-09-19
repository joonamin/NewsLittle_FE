import { describe, expect, it } from "vitest";

import { isSameText, splitSentences } from "./sentences";

describe("splitSentences", () => {
  it("splits on sentence-ending punctuation followed by whitespace, like the backend rule", () => {
    expect(splitSentences("첫 문장이다. 둘째 문장이다! 셋째 문장인가? 넷째다。 다섯째다.")).toEqual([
      "첫 문장이다.",
      "둘째 문장이다!",
      "셋째 문장인가?",
      "넷째다。",
      "다섯째다.",
    ]);
  });

  it("does not split numbers or abbreviations without trailing whitespace", () => {
    expect(splitSentences("유가는 3.5% 올랐다. 다음 주에 발표한다.")).toEqual([
      "유가는 3.5% 올랐다.",
      "다음 주에 발표한다.",
    ]);
  });

  it("treats line breaks as boundaries and drops empty parts", () => {
    expect(splitSentences("첫 줄\n\n둘째 줄  ")).toEqual(["첫 줄", "둘째 줄"]);
  });
});

describe("isSameText", () => {
  it("ignores whitespace and punctuation differences", () => {
    expect(isSameText("같은 글이다.", " 같은  글이다 ")).toBe(true);
    expect(isSameText("같은 글이다.", "다른 글이다.")).toBe(false);
    expect(isSameText(null, "x")).toBe(false);
  });
});
