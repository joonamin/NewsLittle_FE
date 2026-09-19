import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MobileNotice } from "./mobile-notice";

describe("MobileNotice", () => {
  it("renders the notice headline requesting PC web access", () => {
    const html = renderToString(createElement(MobileNotice));

    expect(html).toContain("아직 모바일 버전의 화면은 준비되지 않았어요!");
    expect(html).toContain("PC(데스크톱) 웹 환경에 최적화되어 있어요.");
    expect(html).toContain('data-testid="mobile-notice"');
  });
});
