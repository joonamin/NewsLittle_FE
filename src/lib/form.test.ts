import { describe, expect, it } from "vitest";
import { z } from "zod";

import { parseFormValues } from "./form";

const valuesSchema = z.object({
  text: z.string().min(1),
  selected: z.enum(["left", "right"]),
  selectedIds: z.array(z.string()).min(1),
});

describe("form values", () => {
  it("accepts text, a single choice, and a non-empty multi-select", () => {
    const result = parseFormValues(valuesSchema, {
      text: "headline",
      selected: "left",
      selectedIds: ["one"],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        text: "headline",
        selected: "left",
        selectedIds: ["one"],
      });
    }
  });

  it("reports field paths for empty text, unknown choice, and empty multi-select", () => {
    const result = parseFormValues(valuesSchema, {
      text: "",
      selected: "other",
      selectedIds: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual(
        expect.arrayContaining(["text", "selected", "selectedIds"]),
      );
    }
  });
});
