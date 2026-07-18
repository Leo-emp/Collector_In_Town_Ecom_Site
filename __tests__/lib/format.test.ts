import { describe, it, expect } from "vitest";
import { formatPrice, formatDate, slugify } from "@/lib/format";

describe("formatPrice", () => {
  it("formats integer MMK with commas and Ks suffix", () => {
    expect(formatPrice(45000)).toBe("45,000 Ks");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("0 Ks");
  });

  it("formats large numbers", () => {
    expect(formatPrice(1500000)).toBe("1,500,000 Ks");
  });

  it("formats small numbers without commas", () => {
    expect(formatPrice(500)).toBe("500 Ks");
  });
});

describe("formatDate", () => {
  it("formats ISO date string to readable format", () => {
    const result = formatDate("2026-07-19T10:30:00Z");
    expect(result).toContain("2026");
    expect(result).toContain("Jul");
    expect(result).toContain("19");
  });
});

describe("slugify", () => {
  it("converts product name to URL slug", () => {
    expect(slugify("Nissan GT-R R35 Liberty Walk")).toBe(
      "nissan-gt-r-r35-liberty-walk"
    );
  });

  it("removes special characters", () => {
    expect(slugify("Toyota Supra (A80) — Special")).toBe(
      "toyota-supra-a80-special"
    );
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });
});
