// Helper to detect Node.js environment
const isNode =
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;

export class OhImg {
  constructor(config) {
    if (!config?.publishableKey?.trim()) {
      throw new Error("Publishable key is required");
    }
    if (!config?.webhookSecret?.trim()) {
      throw new Error("Webhook secret is required");
    }

    this.publishableKey = config.publishableKey.trim();
    this.webhookSecret = config.webhookSecret.trim();
    this.baseUrl = config.baseUrl?.trim() || "https://og.ohimg.dev";

    // Initialize crypto for Node.js environment
    if (isNode) {
      import("node:crypto")
        .then((crypto) => {
          this.nodeCrypto = crypto;
        })
        .catch(() => {
          console.warn("Node.js crypto import failed");
        });
    }
  }

  async generateSignature(input) {
    this.validateInput(input);

    const timestamp = Math.floor(Date.now() / 1000);
    const fullUrl = `${input.domain}${input.path}`;

    const payload = `${timestamp}.${this.publishableKey}.${fullUrl}`;
    const signature = await this.hmac(payload);

    return {
      signature,
      timestamp,
      fullUrl,
    };
  }

  async getImageUrl(input) {
    this.validateInput(input);

    const { signature, timestamp, fullUrl } = await this.generateSignature(
      input
    );

    const params = new URLSearchParams({
      url: fullUrl,
      t: timestamp.toString(),
      sign: signature,
      key: this.publishableKey,
    });

    return `${this.baseUrl}?${params.toString()}`;
  }

  validateInput(input) {
    if (!input) {
      throw new Error("Input is required");
    }

    if (!input.path?.trim()) {
      throw new Error("Path is required");
    }

    if (!input.domain?.trim()) {
      throw new Error("Domain is required");
    }

    if (!input.domain.match(/^https?:\/\//)) {
      throw new Error("Domain must include protocol (http:// or https://)");
    }
  }

  async hmac(message) {
    if (!this.webhookSecret) {
      throw new Error("Webhook secret is required");
    }

    // Node.js environment
    if (isNode) {
      // Wait for crypto to be initialized if needed
      if (!this.nodeCrypto) {
        this.nodeCrypto = await import("node:crypto");
      }

      const hmac = this.nodeCrypto.createHmac("sha256", this.webhookSecret);
      hmac.update(message);
      return hmac.digest("base64url");
    }

    // Web Crypto API for browsers/Deno/Cloudflare Workers
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(this.webhookSecret);
      const messageData = encoder.encode(message);

      const key = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const signature = await crypto.subtle.sign("HMAC", key, messageData);

      return this.bufferToBase64Url(signature);
    }

    throw new Error("No crypto implementation available");
  }

  bufferToBase64Url(buffer) {
    // Node.js Buffer
    if (typeof Buffer !== "undefined") {
      return Buffer.from(buffer).toString("base64url");
    }

    // Browser/Deno/Cloudflare
    const bytes = new Uint8Array(buffer);
    const base64 = btoa(String.fromCharCode(...bytes));
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }
}

export const getOGImageUrl = async (config, input) => {
  const ohimg = new OhImg(config);
  return ohimg.getImageUrl(input);
};
