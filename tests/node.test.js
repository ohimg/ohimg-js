import { test } from "node:test";
import assert from "node:assert/strict";
import { OhImg } from "../src/index.js";

test("OhImg in Node.js", async (t) => {
  const ohimg = new OhImg({
    apiKey: "og_live_test",
    webhookSecret: "og_whsec_test",
  });

  await t.test("generates valid URL", async () => {
    const url = await ohimg.getImageUrl({
      path: "/test",
      domain: "https://example.com",
    });

    assert.equal(typeof url, "string");
    assert.ok(url.startsWith("https://og.ohimg.dev"));
    assert.match(url, /key=og_live_test/);
    assert.match(url, /t=\d+/);
    assert.match(url, /sign=[A-Za-z0-9_-]+/);
  });

  await t.test("validates input", async () => {
    await assert.rejects(
      ohimg.getImageUrl({ path: "", domain: "https://example.com" }),
      /Path is required/
    );
  });
});
