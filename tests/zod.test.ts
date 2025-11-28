import { describe, expect, it } from "vitest";
import { z } from "zod";

const DemoFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

describe("DemoFormSchema", () => {
  it("accepts valid values", () => {
    const res = DemoFormSchema.safeParse({ name: "张三", email: "a@b.com" });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.name).toBe("张三");
    }
  });

  it("rejects invalid values", () => {
    const res = DemoFormSchema.safeParse({ name: "A", email: "invalid" });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues.length).toBeGreaterThan(0);
    }
  });
});
