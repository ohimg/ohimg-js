// tests/ohimg.test.ts
import { OhImg, getOGImageUrl } from "../dist";

describe("OhImg SDK", () => {
  const config = {
    apiKey: "og_live_test123",
    webhookSecret: "og_whsec_test789",
    baseUrl: "https://og.ohimg.dev",
  };

  const input = {
    path: "/blog/test-post",
    domain: "https://example.com",
  };

  describe("URL Generation", () => {
    let ohimg: OhImg;

    beforeEach(() => {
      ohimg = new OhImg(config);
    });

    it("generates valid URL with all required parameters", async () => {
      const url = await ohimg.getImageUrl(input);

      expect(url).toMatch(new RegExp("^https://og.ohimg.dev\\?"));
      expect(url).toContain("url=https%3A%2F%2Fexample.com%2Fblog%2Ftest-post");
      expect(url).toContain("key=og_live_test123");
      expect(url).toMatch(/t=\d+/); // timestamp
      expect(url).toMatch(/sign=[A-Za-z0-9_-]+/); // base64url signature
    });

    it("uses custom baseUrl when provided", async () => {
      const customOhimg = new OhImg({
        ...config,
        baseUrl: "https://custom.domain",
      });

      const url = await customOhimg.getImageUrl(input);
      expect(url).toMatch(/^https:\/\/custom\.domain\?/);
    });
  });

  describe("Signature Generation", () => {
    let ohimg: OhImg;

    beforeEach(() => {
      ohimg = new OhImg(config);
    });

    it("generates valid signature object", async () => {
      const result = await ohimg.generateSignature(input);

      expect(result).toHaveProperty("signature");
      expect(result).toHaveProperty("timestamp");
      expect(result).toHaveProperty("fullUrl");

      expect(result.fullUrl).toBe("https://example.com/blog/test-post");
      expect(typeof result.timestamp).toBe("number");
      expect(typeof result.signature).toBe("string");
      // Base64URL format check
      expect(result.signature).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });

  describe("Helper Function", () => {
    it("getOGImageUrl generates same URL as class method", async () => {
      const ohimg = new OhImg(config);
      const url1 = await ohimg.getImageUrl(input);
      const url2 = await getOGImageUrl(config, input);

      // Compare URL parts (ignoring timestamp differences)
      const stripTimestamp = (url: string) =>
        url.replace(/t=\d+/, "t=0").replace(/sign=[^&]+/, "sign=0");

      expect(stripTimestamp(url1)).toBe(stripTimestamp(url2));
    });
  });

  // In tests/ohimg.test.ts, update the Error Handling section:

  describe("Error Handling", () => {
    it("throws error for empty webhook secret", () => {
      expect(
        () =>
          new OhImg({
            ...config,
            webhookSecret: "",
          })
      ).toThrow("Webhook secret is required");
    });

    it("throws error for missing domain", async () => {
      const ohimg = new OhImg(config);

      await expect(
        ohimg.getImageUrl({
          path: "/test",
          domain: "", // Empty domain
        })
      ).rejects.toThrow("Domain is required");
    });

    it("throws error for invalid domain (missing protocol)", async () => {
      const ohimg = new OhImg(config);

      await expect(
        ohimg.getImageUrl({
          path: "/test",
          domain: "example.com", // Missing http(s)://
        })
      ).rejects.toThrow("Domain must include protocol");
    });

    it("throws error for missing path", async () => {
      const ohimg = new OhImg(config);

      await expect(
        ohimg.getImageUrl({
          path: "",
          domain: "https://example.com",
        })
      ).rejects.toThrow("Path is required");
    });
  });
});
