import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { OhImg } from "../src/index.js";

Deno.test("OhImg in Deno", async () => {
  const ohimg = new OhImg({
    publishableKey: "og_live_test",
    webhookSecret: "og_whsec_test",
  });

  const url = await ohimg.getImageUrl({
    path: "/test",
    domain: "https://example.com",
  });

  assertEquals(typeof url, "string");
  assertEquals(url.startsWith("https://og.ohimg.dev"), true);
});
