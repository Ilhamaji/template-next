import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("resolves conflicting utilities in favour of the last value", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("keeps non-conflicting utilities", () => {
    expect(cn("flex", "gap-2")).toBe("flex gap-2");
  });

  it("drops falsy values", () => {
    expect(cn("flex", false, null, undefined, "gap-2")).toBe("flex gap-2");
    expect(cn("flex", "")).toBe("flex");
  });

  it("supports the object form", () => {
    expect(cn({ "font-bold": true, italic: false })).toBe("font-bold");
  });

  it("flattens nested arrays", () => {
    expect(cn(["px-2", ["py-2"]], "m-1")).toBe("px-2 py-2 m-1");
  });

  it("lets a caller override component defaults", () => {
    expect(cn("rounded-full px-4", "px-2")).toBe("rounded-full px-2");
  });

  it("does not merge across different variants", () => {
    expect(cn("hover:bg-red", "bg-blue")).toBe("hover:bg-red bg-blue");
  });
});
