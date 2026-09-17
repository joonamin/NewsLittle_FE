import type { QuizFormat } from "@/features/contracts/api-models";

import {
  createShortformSessionFixture,
  shortformPreviewFixture,
} from "./fixtures";

export function getShortformQuizPreview() {
  return structuredClone(shortformPreviewFixture);
}

export function createShortformQuizSession(format: QuizFormat) {
  return structuredClone(createShortformSessionFixture(format));
}
