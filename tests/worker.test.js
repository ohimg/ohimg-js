import { OhImg } from "../src/index.js";

export default {
  async fetch(request) {
    try {
      const ohimg = new OhImg({
        publishableKey: "omg_pub_test",
        webhookSecret: "omg_whsec_test",
      });

      const url = await ohimg.getImageUrl({
        path: "/test",
        domain: "https://example.com",
      });

      return new Response(
        JSON.stringify({
          success: true,
          url,
          test: "passed",
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};
