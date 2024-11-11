import { OhImg } from "../src/index.js";

export default {
  async fetch() {
    const ohimg = new OhImg({
      apiKey: "og_live_test",
      webhookSecret: "og_whsec_test",
    });

    try {
      const url = await ohimg.getImageUrl({
        path: "/test",
        domain: "https://example.com",
      });

      return new Response(JSON.stringify({ url }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
