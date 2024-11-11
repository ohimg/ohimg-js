import { test, expect } from "@playwright/test";

test("OhImg in browser", async ({ page }) => {
  await page.goto("about:blank");

  const result = await page.evaluate(async () => {
    const { OhImg } = await import("../src/index.js");

    const ohimg = new OhImg({
      apiKey: "og_live_test",
      webhookSecret: "og_whsec_test",
    });

    return ohimg.getImageUrl({
      path: "/test",
      domain: "https://example.com",
    });
  });

  expect(typeof result).toBe("string");
  expect(result).toMatch(/^https:\/\/og\.ohimg\.dev/);
  expect(result).toMatch(/key=og_live_test/);
});
