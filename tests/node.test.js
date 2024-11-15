import { test } from "node:test";
import assert from "node:assert/strict";
import { OhImg } from "../src/index.js";

test("OhImg in Node.js", async (t) => {
  // Initialize once for all tests
  const ohimg = new OhImg({
    publishableKey: "omg_pub_test",
    signatureSecret: "omg_whsec_test",
  });

  // Wait for crypto initialization
  await new Promise((resolve) => setTimeout(resolve, 100));

  await t.test("generates valid URL", async () => {
    const url = await ohimg.getOgImageUrl({
      pageUrl: "https://example.com/test",
    });

    assert.equal(typeof url, "string");
    assert.ok(url.startsWith("https://og.ohimg.dev"));
    assert.match(url, /key=omg_pub_test/);
    assert.match(url, /t=\d+/);
    assert.match(url, /sign=[A-Za-z0-9_-]+/);
  });

  await t.test("validates input", async () => {
    await assert.rejects(
      () => ohimg.getOgImageUrl({ pageUrl: "" }),
      /pageUrl is required/
    );

    await assert.rejects(
      () => ohimg.getOgImageUrl({ pageUrl: "example.com/test" }),
      /pageUrl must include protocol/
    );
  });
});
